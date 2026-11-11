# I-O Workspace backend

Email/password authentication is enabled; email confirmation remains on. No sign-in page or existing screen was changed, and the screens still use demo data rather than these tables.

## Tables

| Table | Purpose |
|---|---|
| profiles | Full name, linked to the auth account; automatically created on signup |
| user_roles | Separate contributor, analyst, hr_reviewer and admin assignments |
| job_roles | Active/archived roles; is_fictional identifies demo roles |
| evidence_items | Source excerpts, references and unique codes per job role |
| contributions | Independent contributor responses |
| role_analysis_versions | Versioned analysis with review and approval state |
| competencies | Definitions, importance 1–5, entry requirement |
| competency_evidence | Competency-to-evidence links |
| evidence_conflicts | Open/resolved disagreements and resolution notes |
| conflict_evidence | Conflict-to-evidence links |
| hiring_packages | Packages linked to approved analyses |
| package_materials | Versioned job postings, work samples and interview guides |
| material_citations | Exact statement-to-evidence links |
| approvals | Review requests, decisions, reviewers and dates |
| activity_log | Append-only, trigger-written before/after history |

## RLS policies and grants

All 15 tables have RLS enabled and `signed_in_read` for authenticated users. Anonymous accounts have neither table grants nor policies. This is intentionally a shared workspace, not tenant-isolated: every signed-in account can read all workspace records, as requested.

- `profiles`: `own_profile_update`, with a column grant for full_name only.
- `user_roles`: `admin_assign_role` and `admin_remove_role`; no client update policy. Signup metadata cannot assign roles.
- `contributions`: `contributor_insert`; only contributors, using their own contributor_id. No client edits or deletes.
- `job_roles`, `evidence_items`, `role_analysis_versions`, `competencies`, `competency_evidence`, `evidence_conflicts`, `conflict_evidence`, `hiring_packages`, `package_materials`, `material_citations`: `editors_insert`, `editors_update`, `editors_delete` for analysts/admins.
- `role_analysis_versions`, `hiring_packages`, `package_materials`: additional `reviewer_update`. Database triggers restrict reviewer-only callers to approval decisions rather than general editing.
- `approvals`: `editors_request` for analyst/admin pending requests made as themselves; `reviewer_decision` for HR reviewers. Final decisions and request identity are immutable.
- `activity_log`: read only for clients; changes are recorded by triggers.
- Privileged service operations have table grants but workflow triggers still protect approved records. Initial fictional analysis approval was performed as a trusted system seed, not assigned to an invented user.

`has_role(user_id, role)` is a security-definer helper with a fixed search path. It queries the separate role table without recursive policies. `convert_contribution_to_evidence` preserves the contribution, copies its text into evidence and records a source reference; only analysts/admins can invoke it successfully.

## Database-enforced workflow

- A package must use an approved analysis for the same job role.
- Only hr_reviewer can approve analyses, packages and materials or decide approval requests; admin alone is insufficient.
- Open material-blocking conflicts prevent package submission and approval.
- Approved analyses/materials are immutable, including their competency/citation children. Submitted/approved package contents are frozen. Evidence used by approved records cannot be silently rewritten.
- Competency, conflict and material citations must point to evidence for the same job role.
- A cited statement must occur literally in its material. Nonempty materials need citations for submission; material approval requires citations. These structural checks cannot prove semantic support for every sentence: professional claim-level review is still required.
- Conflict resolution requires a note; the database stamps the actor and time. Reopening a conflict cannot invalidate already submitted/approved material.
- Dependent workflow writes are serialized to prevent simultaneous approval/edit races.

## Fictional demo

Customer Support Specialist, Customer Experience: EV-01–EV-05; approved v1 with five competencies and ten evidence links; open Refund authority conflict linked to EV-01–EV-04; one needs_review package; blocked v0.1 job posting citing EV-04/EV-05; empty work sample and interview guide.

## Give yourself testing roles

1. Open **More → Users → Add user → Create new user** to create your email account without adding an app sign-in screen.
2. Copy your account ID from Users.
3. Open **More → Database**, select `user_roles`, and add two rows with that same `user_id`: one with `role = admin`, one with `role = hr_reviewer`. Use the trusted Cloud data editor to bootstrap the first admin; app clients cannot self-promote.
4. An account may hold both roles. No account was automatically made admin or reviewer. New accounts receive a profile but no role automatically.

If the editor does not expose row editing, provide your account ID in chat and request these two role assignments; they can be added through the trusted data tool.

## Verification

Ten rollback-only live database probes were executed through the privileged data tool. Each failed write was contained in a subtransaction; only test results were appended to activity_log. The existing Vitest suite checks the latest recorded results (it does not rerun mutations via its read-only CLI), alongside the existing competency/routing tests.

To rerun probes, use the privileged data tool with:

```sql
INSERT INTO public.activity_log(action,entity_type,details)
SELECT 'regression_check','backend_rules',
  jsonb_build_object('rule',r,'passed',public.test_workspace_rule(r))
FROM unnest(ARRAY['approved_analysis','reviewer_analysis','reviewer_package',
  'reviewer_material','reviewer_decision','open_conflict','immutable_analysis',
  'immutable_material','importance','rls']) r;
```

The regression helper is not executable by app clients. Full signed-in browser workflows, signup-trigger execution and per-role RLS mutation flows have not been exercised because this request does not add or connect sign-in/data screens.