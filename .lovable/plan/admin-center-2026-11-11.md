# Admin Center

## Result
Add an Admin-only `/admin` with **People**, **Permissions**, **Settings**, and **Audit log** views, using the existing white content, yellow bands, ink pill actions, Manrope headings, and restrained magenta accents. Keep the current assessment screens and workflow design.

## 1. Access and fictional preview
- Show the Admin Center navigation item only for an active Admin. Block direct access for everyone else, not just the navigation link.
- Add a clearly marked fictional profile selector in demo mode. Choosing **Nicole** opens the demo Admin Center; choosing another fictional person previews their permissions.
- Demo identity never grants access to real people, saved results, settings, or privileged actions. Demo changes remain isolated from live records; no emails are sent.
- Keep the existing app sign-in method. Live access comes from verified accounts and stored roles, never names, email matching, or browser-selected profiles.
- Do not automatically promote the first visitor. If there is still no real Admin, assigning the first verified Admin is a setup prerequisite for live testing.

## 2. People
- Readable table: name, email, multiple organization roles, status (**Invited / Active / Deactivated** with icons), and last active. Show “Not yet active” where appropriate rather than invented dates.
- **Invite person** dialog: name, email, and one or more role checkboxes. Live invitations send a secure account invitation; demo invitations offer **Copy invite link** and open only a fictional acceptance experience.
- Pending invitations do not grant privileges until accepted by the intended verified account. Expired or revoked invitations cannot be reused; support resending pending invitations.
- Edit organization roles; deactivate/reactivate without hard-deleting people or their history. Deactivation immediately blocks existing sessions from protected actions. Prevent removing or deactivating the last active Admin.
- Per-job-role assignments for Hiring manager, SMEs, and Raters, including Daniel as SME + Rater for L&D Specialist. Assignment choices must match the person's organization roles.
- Seed the fictional team in the isolated demo: Nicole (**Admin + I-O analyst**), Maya Chen (**HR**), Daniel Okafor (**Hiring manager + SME + Rater**), Priya Shah (**SME**), Sam Ortiz (**Rater**). Use clearly fictional email addresses; these are not real account invitations.

## 3. Permissions matrix and enforcement
Provide a readable matrix with allowed, assigned-only, and not-allowed labels and icons. Multiple roles combine permissions; deactivation overrides them all.

| Organization role | Allowed actions | Limits |
|---|---|---|
| Admin | All actions, people, assignments, settings, audit | Existing evidence, approval, and score-integrity safeguards still apply |
| HR | Create campaigns, invite/manage candidates, approve batteries, view all results | Cannot edit tests or manually alter scores |
| Hiring manager | View results and record hiring decisions | Assigned job roles only; cannot edit tests or scores |
| I-O analyst | Job analysis, blueprint, test building, validity and fairness reports | No candidate invitations, HR approval, hiring decisions, or manual scoring unless another held role permits it |
| SME | Task/KSAO ratings and critical incidents | Assigned job roles and own source judgments only |
| Rater | Score assigned work samples | Assigned scoring work only; candidate ID, response, and rubric, never candidate identity or demographics |

- Apply these rules across existing pages and actions, including saved interviews and direct data requests—not only inside `/admin`.
- Replace overly broad existing candidate and scoring access with these permissions. Give analysts only the de-identified information necessary for validity/fairness reports.
- Add lightweight campaign records, candidate invitation grouping, hiring-decision capture, and individual work-sample assignments where the existing workflow lacks them. Keep these within existing role/results screens rather than adding an unrelated workflow.
- Candidates remain separate from organization users. Their private links continue to expose only their own test and never answer keys or team access.
- Permission to act never bypasses approved-version immutability, HR release gates, source evidence checks, or scoring rules.

## 4. Settings
- Organization name and uploaded logo; O*NET **Demo / Live** mode; default candidate access window; candidate-data retention period; candidate privacy notice.
- Default retention to **12 months**. Keep the current candidate-window default until the Admin changes it; display its units clearly.
- New invitations use the saved default window. Changing defaults does not silently shorten existing invitations.
- Show the privacy notice before candidates start. Persist settings and validate values.
- Demo O*NET uses the existing official extract. Live mode must fetch official O*NET data with source/version attribution; show an unavailable state if the live service cannot be reached rather than relabeling demo data as live.
- Enforce retention with a scheduled cleanup of expired candidate personal data and responses; preserve minimal non-identifying audit events and organization people history. Make the cutoff visible before saving a retention change.

## 5. Audit log
- Admin-readable, filterable log with actor, action, affected person/job role/candidate ID, timestamp, and safe before/after details.
- Capture invitations, role and assignment changes, deactivation/reactivation, settings changes, approvals, score changes, and hiring decisions.
- Write audit events with the protected operation; users cannot edit or delete them. Never log invitation tokens, passwords, or candidate response bodies.

## 6. Onboarding
- After **“Who knows this job best?”**, show Admins a skippable **INVITE YOUR TEAM** step.
- Invite HR, the hiring manager, and raters; assign them to the current job role where appropriate. Offer **Skip for now** and **Use demo team**.
- “Use demo team” uses fictional preview records only, never fabricates live accounts or grants live permissions. Non-Admins do not see this step.

## Technical implementation
- Add shared permission rules used by the matrix and presentation, with server-validated identity and database-enforced roles, active status, and assignments as the actual security boundary.
- Extend separate role/assignment storage additively. Preserve existing records and map legacy analyst/HR roles to their new display names; keep roles off editable profiles.
- Put protected Admin routes under the managed authenticated layout while preserving URL `/admin`; expose the fictional Admin preview through an explicit isolated demo path/state without weakening live checks.
- Use authenticated server functions for ordinary operations. Verify Admin privileges before loading privileged account-invitation helpers. Add explicit grants, RLS policies, validation triggers, transactional audit writes, and race-safe last-Admin checks.
- Use restricted server projections for blind rating: row filtering alone cannot hide identity fields. Remove direct rater access to identity-bearing candidate records.
- Store logos using managed storage and restrict uploads/settings changes to Admins. Add unique page metadata for new content routes.

## Verification and acceptance
- Unit and database tests for every role rule, assigned-only access, combined roles, deactivation, last-Admin protection, invitation acceptance, privacy notice, candidate windows, and the 12-month retention default.
- Check denied operations through direct requests as well as disabled/hidden controls; verify rater responses contain no candidate names, emails, or demographics.
- Walk demo invitations, copied links, role edits, assignments, onboarding skip/demo-team, settings, and audit filtering at desktop and phone sizes.
- With verified testing accounts, complete real invite/accept, role assignment, save/refresh, deactivation/reactivation, HR invitation/approval, assigned-manager decisions, and blind-rater scoring. Confirm persisted values and audit events through the UI.
- If there are no real testing accounts or no authorized first Admin, report live checks as blocked rather than claiming the demo proves them.

## Scope
No redesign, no hard-deletion of organization people, no candidate user accounts, and no changes to the chosen AI provider. Implementation begins after this plan is approved.