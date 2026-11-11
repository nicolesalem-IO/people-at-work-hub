# Hosting on Netlify + Supabase + Claude

The app no longer needs Lovable to run.

| Piece | Where |
|---|---|
| Hosting | Netlify project `people-at-work-hub` (build settings in `netlify.toml`) |
| Database + sign-in | Supabase project **People at Work Hub** (`ycnrhwutramfxogeodhi`, org ModusHuman). Schema = `drizzle/migrations/0000`–`0028`, plus `0029_post_migration_hardening` applied directly (two trigger-function grants revoked, fixed search paths). |
| AI | Claude via `src/lib/claude.server.ts` (Haiku for the public quick test plan, Sonnet for drafting) |
| Job data | O*NET Web Services v2 via `src/lib/onet.functions.ts` |

## Environment variables (Netlify → Project configuration → Environment variables)

Already set (public values): `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_PROJECT_ID`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID`.

Add these yourself and mark them **secret**. Never commit them:

| Key | Where to get it |
|---|---|
| `ANTHROPIC_API_KEY` | console.anthropic.com → API keys. Set a monthly spend limit there too. |
| `ONET_API_KEY` | services.onetcenter.org → My account |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project settings → API keys (secret / service_role) |

## Supabase sign-in links

Supabase → Authentication → URL configuration: set **Site URL** to the Netlify address (or your custom domain), and add it under **Redirect URLs**.

## Cost guards

The public demo features (quick test plan, AI draft preview) cache results and cap AI calls per server instance each hour. Netlify can run several instances, so the Anthropic spend limit is the real ceiling.
