# Candidate pipeline for approved batteries

## Result
Build the full HR campaign-to-decision workflow using the current yellow bands, white content, ink actions, and existing Admin Center roles and assignments. Add a mobile-friendly private candidate experience at `/take/$token` with no candidate account.

## 1. Campaign launch
- **Launch assessment** appears on a battery with a recorded HR approval. Explain missing approval or incomplete release requirements for blocked batteries.
- HR and Admin create campaigns with job role, immutable approved battery version, opening/closing dates, candidate access window, and welcome message.
- Default the candidate window from organization settings; allow a campaign-specific value such as **5 days**. Candidate expiry is the earlier of their individual window and campaign closing date.
- Campaigns keep their original battery version if a new draft is created later.

## 2. Candidate invitations and pipeline
- Add candidates individually by name/email, paste CSV, or upload CSV. Preview rows, highlight malformed or duplicate entries, and confirm before creating invitations.
- Generate unique unguessable links at `/take/$token`, store only token hashes, and keep candidates separate from organization users.
- Demo offers **Copy link** and **Open as candidate**; live invitations send email with the campaign welcome message and expiry.
- Show derived pipeline stages: **Invited → Started → Submitted → Auto-scored → Rater review → Scored → Decision recorded**. Persist timestamps and history so labels reflect actual events rather than editable display state.
- Revoked, expired, or completed links show friendly states. A submitted link never starts a second attempt.

## 3. Candidate experience
- Yellow welcome band with role name, total allotted time, sections, welcome message, privacy/retention notice, and consent.
- Accommodation request types: extra time, screen reader, other. HR reviews requests before testing starts; display the agreed arrangement to the candidate.
- Practice item before each timed section. Only the current section's permitted questions reach the candidate browser; answer keys stay private.
- Randomize question order and option order once per attempt, persist that order, and score against canonical option IDs so resume and scoring stay consistent.
- Autosave every response with pending/saved/error states and retry. Persist response time and server-checked section deadlines. Resume through the same link within the access window; leaving does not reset timers.
- Accessible keyboard and screen-reader controls. No webcam, invasive proctoring, or candidate sign-in.
- **Review and submit** lists unanswered items. Submission locks responses and confirms: **“Thanks, your responses were received.”**

## 4. Scoring and Rater queue
- Submission automatically scores aptitude, job knowledge, and SJT agreement with the SME key.
- Assign **two active Raters** to each work sample through the existing Admin assignment controls.
- Blind queue exposes candidate ID only, assigned response, rubric, and 1–5 anchored dimensions. Require a comment for every submitted rubric rating.
- More than **1 point** disagreement on any dimension blocks final scoring and flags third-rater review or a recorded consensus discussion. Preserve independent ratings and reconciliation history.
- Calculate section, KSAO, and blueprint-weighted composite profiles only when required parts are complete. Compare with recorded cuts without making a hiring decision.

## 5. Results and fairness
- HR sees all campaign results; Hiring managers see only assigned roles. Candidate list includes stage, composite, pass/below-cut and KSAO profile chart.
- Candidate details show section scores, relevant Rater comments, and decision history. Hiring managers record **advance / hold / reject**, with a required reason.
- Keep **“Recommendation requires human review.”** visible. Nothing decides automatically.
- Fairness reports show optional self-reported group pass rates and the four-fifths check, visible to **HR and I-O analyst**, plus Admin. Never expose demographics to Raters or Hiring managers during scoring.
- This explicitly adds HR fairness access and replaces the current provisional hire/hold/decline decision labels with the requested advance/hold/reject choices while preserving historical records.

## 6. Storage, privacy and audit
- Extend the existing campaign/attempt storage additively with candidate records, responses/timing, normalized scores, and independent Rater scores; keep approved batteries and historical interviews intact.
- Enforce campaign dates, one attempt, consent, accommodation approval, server deadlines, immutable submissions, Rater assignments, required comments, and permission checks in protected actions and database safeguards.
- Extend the existing **12-month default** retention cleanup to all new candidate personal data and response records. Preserve minimal non-identifying audit history.
- Audit invitations, accommodation decisions, score changes, reconciliation, and hiring decisions; never log raw tokens or response bodies.
- Preserve existing `/candidate/$token` links, redirecting to the new experience without breaking invitations.

## 7. Fictional demo
- One campaign with five clearly fictional candidates: **1 invited, 1 in progress, 1 awaiting Rater review, 2 fully scored**.
- Seed realistic persisted stage/timing/score records as well as an isolated signed-out preview, with working demo links that cannot access live records.
- Use the existing fictional team for HR, manager, and Rater previews. Demo email is never sent.

## Verification
- Tests for HR-only launch, actual approval record, date/window boundaries, unique tokens, CSV validation, one attempt, consent, accommodations, autosave/resume, randomized-option scoring, submission lock, automatic scoring, two Raters, >1-point disagreement, weighted composite, required decision reasons, and fairness visibility.
- Browser walkthroughs on desktop and phone: HR launch → CSV invitation → candidate consent/practice/timed autosave/resume → submit → blind ratings → results → manager decision → fairness.
- Verify denied direct requests, not only hidden controls, and confirm candidate/Rater responses contain no answer keys or unauthorized identities/demographics.
- Run live account checks only with a verified testing account and first Admin. The connected app currently has **zero real accounts**, so these checks remain blocked until one is provisioned; fictional preview checks are reported separately.

## Current foundation and boundaries
- Reuse the Admin Center, multiple organization roles, job assignments, blind scoring boundary, settings, privacy notice, retention schedule, and audit writer already added.
- The Admin demo and database-boundary tests pass; live invitation/acceptance and signed-in refresh checks are not yet verified because there are no real accounts.
- Do not redesign the app, add candidate accounts, or change the AI provider. Implementation of this new pipeline begins after approval.