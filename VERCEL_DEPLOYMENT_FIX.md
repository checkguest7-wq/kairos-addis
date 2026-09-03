# Kairos Addis — Vercel deployment fix

## What was fixed
- The Vercel API entry point now imports the server app from `api/server/app.ts`, keeping the server function source inside the `api/` function tree.
- A Vercel-specific copy of the server modules is included under `api/server/`.
- The runtime vehicle/type dependencies needed by that server copy are included under `api/src/`.
- `/api/*` is rewritten to the Express function at `/api/index`.
- The frontend fallback remains `/index.html`.
- Local development still uses the original `server.ts` and `server/` tree.
- Node engine is pinned to a modern supported range.

## Production database
Set `DATABASE_MODE=supabase` and configure:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_ANON_KEY` (if client-side Supabase use is needed)

The server already contains a Supabase persistence layer. Vercel should not be treated as persistent storage for `data/portal-db.json`.

## Email
For production verification/reset emails configure:
- `GMAIL_USER`
- `GMAIL_APP_PASSWORD`
- optionally `SMTP_HOST` and `SMTP_PORT`

## Admin
Configure the admin variables used by the project, such as `ADMIN_EMAIL` and `ADMIN_DEFAULT_PASSWORD`.

Never commit `.env` or secrets to GitHub. Configure them in Vercel Environment Variables.
