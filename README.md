# Al-Hayat Quran Learning Portal - Next.js Cloudflare Version

This is the free-hosting rebuild of the Al-Hayat Quran Learning Portal.

## Stack

- Next.js
- TypeScript
- Tailwind CSS
- Lucide React icons
- Cloudflare Workers
- Cloudflare D1 database
- Cloudflare DNS/domain: `learn-quran.drimranhayat.com`

## Current Features

- Premium academy public homepage
- Course catalog
- Teacher application page
- D1-backed login with secure HTTP-only session cookies
- One-time first-admin setup protected by `SETUP_TOKEN`
- Authenticated admin control center
- Authenticated teacher, student, and parent dashboards
- Cloudflare D1 SQL schema for real portal data
- Cloudflare deployment scripts

## Local Development

```bash
npm install
npm run dev
```

Open:

```text
http://localhost:3000
```

Useful pages:

```text
/
/login
/setup
/dashboard
/admin
/apply
```

## Cloudflare Setup

Login to Cloudflare:

```bash
npx wrangler login
```

Create the D1 database:

```bash
npx wrangler d1 create al_hayat_quran
```

Copy the returned `database_id` into `wrangler.jsonc`.

Apply the schema:

```bash
npx wrangler d1 execute al_hayat_quran --file db/schema.sql
```

Apply auth/session migrations:

```bash
npx wrangler d1 execute al_hayat_quran --file db/migrations/0002_auth_seed.sql --remote
```

Set the first-admin setup secret:

```bash
npx wrangler secret put SETUP_TOKEN
```

Then open:

```text
https://learn-quran.drimranhayat.com/setup
```

Use the setup token once to create the first admin account. After an admin exists, `/setup` redirects to `/login`.

Preview Cloudflare Worker locally:

```bash
npm run preview
```

Deploy:

```bash
npm run deploy
```

## GitHub Auto Deployment

The repository includes a GitHub Actions workflow:

```text
.github/workflows/deploy-cloudflare.yml
```

It runs automatically on every push to `main`.

To activate it, add this GitHub repository secret:

```text
CLOUDFLARE_API_TOKEN
```

Create the token in Cloudflare:

```text
Cloudflare Dashboard -> My Profile -> API Tokens -> Create Token
```

Use permissions that allow deploying Workers and reading/editing the required account resources.

Then add it in GitHub:

```text
GitHub repo -> Settings -> Secrets and variables -> Actions -> New repository secret
```

## Cloudflare Domain

After deploy, connect the custom domain:

```text
learn-quran.drimranhayat.com
```

In Cloudflare Workers settings, add a custom domain/route for the deployed Worker.

## Next Development Steps

1. Add real authentication with secure password hashing and sessions.
2. Connect dashboard pages to Cloudflare D1 queries.
3. Build CRUD screens for courses, teachers, students, parents, classes, attendance, homework, progress, payments, tickets, and announcements.
4. Add Urdu translations.
5. Add email notifications.
6. Add file upload support with Cloudflare R2.
7. Add production seed data and admin invite flow.
