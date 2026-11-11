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

## AI
- AI calls go through @lovable.dev/ai-gateway inside createServerFn handlers (src/lib/*.functions.ts); evidence citations are re-validated server-side because model output is untrusted.

## Database
- Enforce workflow approvals, immutable approved records and same-role evidence links in PostgreSQL triggers as well as RLS, so direct data requests cannot bypass the workflow.
- Keep audit history trigger-written and client-read-only, and serialize dependent workflow changes with a transaction advisory lock to prevent approval/edit races.
- Interview collection, evidence review and purpose-matched outputs use persistent Cloud records; unrelated legacy screens remain demos to keep the interview request scoped.
- Interview coverage is deterministic and source-counted; database triggers enforce HR approval and version-bound output eligibility because neither AI output nor browser state can authorize drafting.
