# Nicole Salem visual redesign

## Scope
- Change presentation and navigation only. Keep saved data, permissions, scoring, evidence, coverage, approval rules and candidate features unchanged.
- Apply the new brief across the practitioner workspace; preserve the plain, accessible candidate testing experience.

## Your roles dashboard
- Make Home **YOUR ROLES**, with one card per accessible role: magenta purpose/O*NET eyebrow, bold title, current status, yellow progress bar and **Continue →**.
- Keep the existing fictional preview separate from saved records. Move the preview/sign-in notice into a slim banner above the workspace, with a signed-in account state.
- Keep saved interviews, historical outputs and candidate results accessible without duplicating or deleting records.

## Role navigation
- Add a named horizontal stepper: **Define role · Benchmark · SME ratings · Blueprint · Build tests · Pilot & fairness · HR approval**.
- Completed steps show a check; the current step uses yellow. Completion reflects existing coverage and approval rules, not a new visual-only rule.
- Give each step a large yellow opening band with an uppercase title, a short contextual sentence and an ink pill action.
- Separate existing setup, benchmark and ratings views into focused screens. Keep critical incidents and authority as separate focused views rather than a wall of fields.

## Visual system
- White background, near-black ink, ink-at-65% muted text, ink-at-14% hairlines, and white/off-white secondary surfaces.
- Large yellow bands and progress accents. Magenta **#D11A75** only for eyebrows, links, logo dot and focus rings; remove light-pink fills.
- **Manrope 800** uppercase page/section headings, **DM Sans 400** body, 13px uppercase eyebrows and 24px normal-case card titles.
- Hero titles: 96–112px desktop, 48px mobile where they fit. Keep font sizes fixed at layout breakpoints, wrap long names safely, and use neutral heading letter spacing for readability.
- Ink primary pills with white text and arrow icons; outline secondary pills. Repeated cards use 16px corners.
- Use generous spacing, asymmetric editorial grids and full-width section rules, without decorative nested cards.

## Focused work screens
- Replace dropdown ratings with accessible **1–5** tap targets while preserving the exact stored rating values.
- Put coverage in a sticky right column with a yellow progress ring, source counts and clear gap labels; stack it safely on phones.
- Present disabled actions as outlines with the actual missing requirements nearby. Keep permission and approval restrictions intact.
- Blueprint/Build tests show prominent method summaries: Skills test, Aptitude, SJT, Job knowledge and Structured interview, with weight, time and covered KSAOs.
- Show **Ready for HR review** in yellow only when the current eligibility checks actually pass.

## Verification
- Check desktop and phone layouts, long role names, keyboard navigation, contrast and visible focus states.
- Run existing scoring, interview and navigation tests to confirm the redesign does not change behavior.
- Verify dashboard → role → ratings → blueprint → builders → fairness → HR review navigation against the live preview.

## Existing work and blockers
- Current assessment pages render without browser errors; the 32 selected assessment/interview/navigation tests pass, and the latest preview check reports no errors.
- Interview answer saves already create persistent dated evidence in Lovable Cloud. Added a Saved interviews page so that flow remains accessible.
- Signed-in save/refresh testing remains blocked: the connected app currently has **zero accounts**, confirmed by an account-count check. No account or reviewer privileges will be invented.
- Claude drafting remains unavailable under the workspace AI policy. Candidate end-to-end testing, persistent assessment demonstration records and additional database safeguards remain unfinished from the assessment implementation; they are separate from this visual-only redesign.

## Approval
- No redesign changes will begin until you approve the plan.