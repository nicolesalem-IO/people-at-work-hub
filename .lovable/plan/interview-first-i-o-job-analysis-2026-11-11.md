# Interview-first I-O job analysis

## Proposed changes
- Make structured job analysis the first experience, rather than directing users to a hiring package. Preserve the existing Nicole Salem visual style.
- Start every new analysis with four purpose-first questions: purposes (multi-select, no hiring default); role and whether it is new/changing/existing; sources (incumbents, supervisors, HR, documents/SOPs, observation); and number of incumbents plus locations/teams.
- Interview one module at a time, with 3–6 questions per turn and follow-ups based on missing details. Preserve answers when returning to an earlier module or resuming later.
- Save every answer as dated, source-attributed evidence. Count distinct sources, not the number of answers or repeated submissions from one person.
- Show an **Analysis coverage** panel with required modules, **Not started / Partial / Covered** labels and icons, source counts, and the next missing questions.
- Record source disagreements as open conflicts linked to the original evidence; never automatically choose the supervisor's answer.
- Block all output drafting, including the existing competency draft action and direct visits to output pages, until every required module is covered and HR approves the current analysis version.
- Once coverage is complete, offer HR review first. After approval, offer only outputs appropriate to the selected purposes; training must not default to a job posting.
- Add clearly fictional **Warehouse Shift Lead** data with **training & development** as its purpose, two distinct sources, some covered modules, remaining gaps and an open disagreement. Keep the existing Customer Support Specialist records intact.

## Interview modules
- **A — Role context:** role purpose, reporting line, direct reports, internal/external contacts, schedule and work location/remote arrangement.
- **B — Tasks:** duties, with frequency, importance (1–5), consequences of error, time spent (%) and day-one versus learned-on-the-job expectations for each task. Repeat task follow-ups in manageable turns.
- **C — Critical incidents:** excellent and poor performance examples, including actions and outcomes.
- **D — KSAOs:** knowledge, skills, abilities and other characteristics; entry requirements versus trainable qualities; links to the tasks each supports.
- **E — Tools & technology:** systems, software, equipment and required certifications/licenses.
- **F — Decision authority & judgment:** independent decisions, approvals and specific limits.
- **G — Work context:** physical demands, environment, pace, emotional demands, travel and essential-function flags for tasks.
- **H — Performance standards:** measures, targets and proficiency after 6–12 months.
- **I — Change & future:** expected changes over the next 1–2 years.
- For compensation/job evaluation, additionally collect budget, headcount and organizational impact.

## Required coverage by purpose
| Purpose | Required modules |
|---|---|
| Selection/hiring | A, B, C, D, F, G |
| Training & development | A, B, C, D, E, H |
| Performance management | A, B, C, H |
| Compensation/job evaluation | A, B, D, F, G, plus scope |
| Legal/ADA documentation | A, B, G |
| Workforce/succession planning, job redesign, other | A, B, D |

- Multi-select purposes require the union of their modules; the remaining modules stay optional.
- A required module is **Covered** only when its core questions are answered and at least two distinct sources contributed. Missing fields or insufficient sources remain **Partial**.
- When the role has exactly one incumbent, allow complete core answers from one source, with an explicit limited-source warning. The warning remains visible for HR review and later outputs.
- Optional modules do not block approval. Coverage and conflict resolution are separate: contradictions stay visible, and unresolved material-blocking conflicts continue to block review/output progression under the existing safeguards.
- Changes to purposes, required answers or supporting evidence after approval require a new analysis version and renewed HR approval; an old approval cannot unlock a changed analysis.

## Purpose-matched outputs
- Selection/hiring: competency summary and hiring materials.
- Training: training-needs summary and training plan.
- Performance management: performance standards and evaluation criteria.
- Compensation/job evaluation: role-scope and job-evaluation summary.
- Legal/ADA: essential-functions and work-demands documentation for professional review, not a legal determination.
- Workforce/succession planning: capability and succession needs summary.
- Job redesign: current versus proposed task/role summary.
- Other: confirm the intended deliverable before drafting; do not silently substitute a hiring output.
- Outputs cite saved evidence and retain limitations and unresolved disagreements rather than presenting invented certainty.

## Technical implementation
- Extend the existing Lovable Cloud records for analysis purposes, role context, stable source identities, interview answers, module coverage and general purpose-specific outputs. Reuse existing evidence, conflict, approval and audit structures where practical.
- This request connects the interview and associated evidence/review/output controls to persistent data; it does not connect unrelated legacy demo screens.
- Keep the existing account model and role assignments. Validate identity and analyst/contributor/HR permissions server-side; do not auto-assign reviewer privileges or change sign-in methods.
- Define deterministic core-question and coverage rules shared by the interview UI and server validation, with equivalent database checks. AI may propose follow-ups or conflicts but cannot award coverage or approve an analysis.
- Use AI Gateway in server functions, revalidating generated evidence references and structured responses. Keep the current working model until the previously identified Claude policy restriction is lifted; a model switch is not part of this change.
- Enforce coverage, HR approval, same-role evidence links, version immutability and draft eligibility in database rules as well as server functions. Preserve trigger-written audit history and transaction locking for approval/edit races.
- Update existing output entry points so neither a direct AI request nor a deep link can bypass interview coverage and approval. Existing demo materials may be inspected, but cannot be drafted/changed as if newly approved under the new rules.
- Seed the new fictional role and literal evidence/answer rows in a migration; never seed during page loading.
- Add app-specific page metadata for added or changed pages and retain accessible forms, contrast and icon-plus-label statuses.

## Verification before completion
- Test each purpose's exact required-module set, multi-purpose unions, core-question completeness, distinct-source counting and the single-incumbent warning exception.
- Test task ratings/time validation, source attribution and dates, same-role evidence links, and conflict logging without choosing a winning source.
- Test incomplete-coverage rejection, non-HR approval rejection, approval version binding and prevention of drafting before approval, including direct server/data requests.
- Test that training offers training outputs, not a job posting, and that output citations reference saved evidence.
- Exercise the signed-in flow end-to-end: purpose setup → answer/save → resume after refresh → coverage and conflicts → HR review → appropriate output. Verify role restrictions with authorized test accounts and report any account-dependent checks that cannot be completed.
- Check desktop/mobile layouts, run relevant regression tests and confirm the preview reports no errors.

## Approval
No application or database implementation will begin until you approve this plan.