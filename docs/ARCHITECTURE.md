# Architecture

Al-Hayat Quran Learning Portal is a Next.js App Router application deployed to Cloudflare Workers through OpenNext. It uses Cloudflare D1 as the system of record and server-rendered dashboards for admin, teacher, student, and parent workflows.

## System Overview

```mermaid
flowchart LR
  Browser["Browser"] --> Middleware["Next middleware"]
  Middleware --> Pages["App Router pages"]
  Middleware --> Api["API routes"]
  Pages --> Auth["Auth helpers"]
  Api --> Auth
  Pages --> Academy["Academy data helpers"]
  Api --> DbHelpers["DB helper modules"]
  Auth --> D1["Cloudflare D1"]
  Academy --> D1
  DbHelpers --> D1
  Api --> Email["Email helpers"]
  Email --> Resend["Resend API"]
```

## Runtime Layers

- `src/app`: public pages, dashboard pages, and route handlers.
- `src/components`: reusable UI pieces such as CSRF fields and dashboard widgets.
- `src/lib/auth.ts`: password hashing, session creation, session cookies, and role checks.
- `src/lib/db.ts`: Cloudflare environment and D1 binding access.
- `src/lib/db/*`: focused database helpers for common entity operations.
- `src/lib/utils/*`: error handling, validation schemas, CSRF, authorization, audit logging, rate limiting, logging, and email verification helpers.
- `src/lib/types/*`: shared API response types.

## Authentication Flow

```mermaid
sequenceDiagram
  participant User
  participant Login as /api/auth/login
  participant D1
  participant Session as sessions table

  User->>Login: POST email, password, CSRF
  Login->>D1: Check rate limit window
  Login->>D1: Load active user by email
  Login->>Login: Verify PBKDF2 password
  Login->>Login: Require email_verified_at
  Login->>Session: Insert hashed session token
  Login-->>User: Redirect with HTTP-only session cookie
```

Sessions are stored as SHA-256 token hashes in D1. Cookies are HTTP-only, same-site lax, secure, and expire after seven days.

## Security Controls

- Input validation uses Zod schemas in `src/lib/utils/schemas.ts`.
- API route failures are normalized through `handleError`.
- HTML form mutations use CSRF tokens.
- Role gates use `requireRole`.
- Ownership checks live in `src/lib/utils/authorization.ts`.
- Sensitive writes emit audit log records.
- Soft deletes use `deleted_at`; reads should filter deleted records.
- Login attempts are rate limited through the D1-backed `login_rate_limits` table.
- Email verification is required before login for newly registered real email accounts.
- Middleware applies baseline security headers.

## Error Handling Strategy

Route handlers should wrap work in `try/catch` and call `handleError(error)` for JSON errors. Existing browser form routes preserve redirect behavior for validation failures so current HTML workflows keep working.

JSON success responses should use `createApiResponse(data, message?, statusCode?)`.

## Data Flow

Dashboard pages call `getDashboardData` and related academy helpers server-side. API routes use `getDb` or focused DB helpers to perform validated writes and ownership-scoped JSON reads.

```mermaid
flowchart TD
  Form["HTML form"] --> PostRoute["POST route"]
  PostRoute --> Validate["Zod validation"]
  Validate --> Csrf["CSRF check"]
  Csrf --> Role["Role/ownership check"]
  Role --> D1["D1 mutation"]
  D1 --> Audit["audit_logs"]
  Audit --> Redirect["Redirect back to dashboard"]

  Client["JSON client"] --> GetRoute["GET route"]
  GetRoute --> RoleRead["Role/ownership check"]
  RoleRead --> ReadD1["D1 read with deleted_at filters"]
  ReadD1 --> Json["createApiResponse"]
```

## Deployment

The Cloudflare deploy workflow runs linting, applies migrations, and deploys the Worker. Test workflow runs lint plus Jest coverage on push and pull request.
