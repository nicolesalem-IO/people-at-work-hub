<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

## Hosting and services (project decision, Nov 2026)
- This app is hosted on Netlify (netlify.toml, NITRO_PRESET=netlify), not Lovable hosting. Don't change netlify.toml or the build command.
- The database is the owner's own Supabase project. Schema changes are applied there as numbered migrations; don't add Lovable Cloud tables or migrations.
- Secrets (ANTHROPIC_API_KEY, ONET_API_KEY, SUPABASE_SERVICE_ROLE_KEY) live in Netlify environment variables. Never put secret values in the repo or browser code.

## AI
- AI calls use the Claude API through src/lib/claude.server.ts (claudeJson) inside createServerFn handlers, not @lovable.dev/ai-gateway. Keep it that way; don't reintroduce the gateway or LOVABLE_API_KEY.
- Model output is untrusted: it is validated server-side (item-draft.ts, packet.ts packetProblems) and stays a draft until experts and HR approve.

## Design changes in Lovable
- Visual and layout changes are welcome: styles.css, page layout, components' markup and copy.
- Don't change the logic in src/lib/packet.ts, src/lib/kit-rules.ts, src/lib/onet-api.ts, src/lib/claude.server.ts, *.functions.ts, or the redirects in src/routes for old pages. Tests in src/test cover them.
- Keep plain-language labels on screen; research terms belong in the glossary (src/lib/plain-language.ts) and Term tooltips.
- The flow is one role at a time: Job analysis, Hiring test, Candidates, Scoring, Decisions & fairness (src/components/io/RoleStepper.tsx). Team members use My tasks (/kit).

## Database
- Enforce workflow approvals, immutable approved records and same-role evidence links in PostgreSQL triggers as well as RLS, so direct data requests cannot bypass the workflow.
- Keep audit history trigger-written and client-read-only, and serialize dependent workflow changes with a transaction advisory lock to prevent approval/edit races.
- Job analysis, Evidence, Contribute and Outputs share persistent interview records; signed-out pages use the same fictional preview, while legacy hiring material remains read-only.
- Interview coverage is deterministic and source-counted; database triggers enforce HR approval and version-bound output eligibility because neither AI output nor browser state can authorize drafting.
- Assessment batteries use versioned payloads with database approval guards; candidate invitations use hashed bearer tokens and return question-only projections so answer keys never reach candidate browsers.
- Keep prior structured interviews accessible alongside rating-based assessments; answer saves atomically create dated evidence through the database function and read back persisted rows.

## Presentation
- Practitioner pages share a roles dashboard, named stepper, reusable step bands and battery method summaries; progress derives from existing workflow checks so presentation cannot unlock actions.

## Administration
- Organization roles and active status live in separate protected tables; shared permission helpers drive presentation while database policies and protected actions authorize every operation.
- Fictional profile selection affects isolated demo data only and never authorizes live reads or writes.
- Blind work-sample scoring uses restricted projections and per-attempt/item assignments rather than exposing identity-bearing candidate rows to raters.
- Candidate pipeline timing, one-attempt state, canonical option IDs, submission locks and scoring are enforced by transactional private-token actions; candidate browser payloads omit answer keys and future timed sections.
- Demo pipeline progress is isolated browser storage with explicit fictional links, never a live authorization source.
- Keep demo section counts separate from the shown item subset; item minute allocations drive both blueprint totals and candidate timers so duration stays consistent.
- Version staged selection separately from legacy attempts; shared stage helpers enforce ordered demo invitations and finalist-only scoring, while live staged writes stay blocked until transactional database guards are applied.
- Use the shared glossary and Term control for plain-language assessment labels so definitions and accessible technical tooltips stay consistent.

## Onboarding
- Persist owner-scoped setup separately from protected organization roles; self-selected practitioner preference changes wording, never authorization.
- Use private projections for non-analyst battery reads and atomic own-source SME merges so individual ratings never leak through full battery payloads.
