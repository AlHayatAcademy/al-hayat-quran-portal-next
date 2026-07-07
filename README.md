# Al-Hayat Quran Learning Portal

Next.js 15 + TypeScript portal for Al-Hayat Quran Learning Portal, deployed to Cloudflare Workers with Cloudflare D1.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Lucide React icons
- Cloudflare Workers through OpenNext
- Cloudflare D1
- Jest and Testing Library

## Features

- Public homepage, teacher application, registration, invitation, password reset, and email verification flows
- HTTP-only session authentication with PBKDF2 password hashing
- Role dashboards for admin, teacher, student, and parent users
- CSRF protection for form mutations
- Zod validation and centralized API error handling
- Audit logging for sensitive operations
- Soft-delete-aware database access
- D1-backed login rate limiting
- Teacher/student JSON read endpoints for classes, homework, progress, attendance, and assigned students
- GitHub Actions for tests and Cloudflare deploy

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [Database](docs/DATABASE.md)
- [API route status](API_ROUTES_STATUS.md)
- [Environment example](.env.example)

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

Useful routes:

```text
/
/login
/setup
/dashboard
/admin
/apply
/register
/forgot-password
```

## Environment

Required bindings and variables:

- `DB`: Cloudflare D1 binding.
- `SETUP_TOKEN`: secret used once to create the first admin.
- `APP_URL`: canonical app URL for generated links.

Optional email delivery:

- `RESEND_API_KEY`
- `EMAIL_FROM`

If email settings are absent, email helpers log a warning and the app continues where manual link delivery is supported.

## Database Setup

Create the D1 database:

```bash
npx wrangler d1 create al_hayat_quran
```

Copy the returned `database_id` into `wrangler.jsonc`.

For a fresh database:

```bash
npx wrangler d1 execute al_hayat_quran --file db/schema.sql --remote
```

For an existing database, apply migrations in order:

```bash
npx wrangler d1 execute al_hayat_quran --file db/migrations/0002_auth_seed.sql --remote
npx wrangler d1 execute al_hayat_quran --file db/migrations/0003_invitation_tokens.sql --remote
npx wrangler d1 execute al_hayat_quran --file db/migrations/0004_soft_deletes_audit.sql --remote
npx wrangler d1 execute al_hayat_quran --file db/migrations/0005_indexes.sql --remote
npx wrangler d1 execute al_hayat_quran --file db/migrations/0006_password_reset_tokens.sql --remote
npx wrangler d1 execute al_hayat_quran --file db/migrations/0007_email_verification_rate_limits.sql --remote
```

## Cloudflare Setup

Login to Cloudflare:

```bash
npx wrangler login
```

Set secrets:

```bash
npx wrangler secret put SETUP_TOKEN
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put EMAIL_FROM
```

Preview Worker locally:

```bash
npm run preview
```

Deploy:

```bash
npm run deploy
```

After deployment, connect the custom domain:

```text
learn-quran.drimranhayat.com
```

## First Admin

Open:

```text
https://learn-quran.drimranhayat.com/setup
```

Use `SETUP_TOKEN` to create the first admin. After an admin exists, `/setup` redirects to `/login`.

## Quality Checks

```bash
npm run lint
npm test
npm run test:coverage
npm run build
```

## GitHub Actions

- `.github/workflows/test.yml` runs lint and Jest coverage on push and pull request.
- `.github/workflows/deploy-cloudflare.yml` runs on pushes to `main`, applies guarded D1 migrations, and deploys the Worker.

Required repository secret:

```text
CLOUDFLARE_API_TOKEN
```

## Remaining Work

- Add targeted admin JSON list endpoints if a separate API client needs them.
- Add explicit edit/delete UI and matching `PUT`/`DELETE` routes only where product flows require them.
- Add optional admin 2FA.
- Add broader route/component tests as workflows mature.
