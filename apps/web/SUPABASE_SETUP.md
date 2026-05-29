Supabase setup (cloud or local)

1) Cloud project
- Go to https://app.supabase.com and create a new project.
- After creation, open Project -> Settings -> API and copy:
  - `Project URL` -> set `NEXT_PUBLIC_SUPABASE_URL` in .env.local
  - `anon` key -> set `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `service_role` key -> set `SUPABASE_SERVICE_ROLE_KEY` (server only)
- Add Redirect URLs in Authentication settings: `http://localhost:3000` and your production URL.
- Run SQL from `infra/db/schema.sql` in the SQL Editor to create tables.
- Optionally run `infra/db/seed.sql` to add sample data.

2) Local dev (Supabase CLI + Docker)
- Install Supabase CLI: `npm install -g supabase` (requires Docker)
- Initialize and start local Supabase in project root or any folder:
  ```bash
  supabase init
  supabase start
  ```
- Local API UI: http://localhost:54322 (admin) and API: http://localhost:54321
- Get anon/service keys from the local dashboard and populate `.env.local`.
- Apply schema using psql or Supabase SQL Editor; example psql command:
  ```bash
  psql "$DATABASE_URL" -f infra/db/schema.sql
  psql "$DATABASE_URL" -f infra/db/seed.sql
  ```

3) Useful npm scripts (apps/web/package.json)
- `npm run supabase:init` -> `supabase init`
- `npm run supabase:start` -> `supabase start`
- `npm run db:schema` -> runs psql against $DATABASE_URL to apply schema
- `npm run db:seed` -> runs psql to seed sample data

4) .env.local
- Copy `apps/web/.env.local.example` to `apps/web/.env.local` and fill values. Do NOT commit `.env.local`.

5) Run app
```bash
cd apps/web
npm install
npm run dev
```

6) Deploy-ready checklist
- `apps/web/.env.local` exists locally and is not committed.
- Supabase Redirect URLs include your localhost ports and production domain.
- RLS policies are applied for `accounts` and `transactions`.
- Email confirmation is disabled if you want immediate signup/login.
- Run `npm run deploy:check` before publishing.
- Use production environment variables in your hosting platform.

If you want, I can:
- create a migration and commit it to `infra/migrations/` (requires Supabase CLI usage),
- or run psql commands locally if you provide `DATABASE_URL` here (not recommended for secrets).

Tell me which step to do next: create `.env.local` example already done, so I can (A) add migration files, (B) add CI scripts, or (C) walk you through running the local Supabase CLI step-by-step.
