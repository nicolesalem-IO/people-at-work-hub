# Staged hiring and plain-language assessments

## Keep the current design
Keep the white workspace, yellow bands and progress, ink actions, typography, spacing and accessible status icons. Restructure the assessments and candidate journey without a visual redesign.

## 1. Plain language throughout
- Apply all requested labels: **Skills needed on day one**, **Test plan**, **Job scenarios**, **Hands-on tasks**, **Reasoning questions**, **Overall score**, **Passing score**, **Fairness check**, **Expert ratings**, and **Try out & check fairness**.
- Add a small, keyboard-accessible information icon beside these labels showing the original I-O term. Use the same wording in headings, tables, forms, summaries and printouts.
- Add **/glossary**, linked in the footer, with concise definitions.
- Remove **Saved interviews** from navigation and retire the old Warehouse Shift Lead page. Preserve saved evidence and audit history; old published links will redirect to an appropriate current page rather than break.

## 2. Four hiring stages, always in order
Show a numbered **0 → 1 → 2 → 3** hiring stepper in campaign administration, candidate details and the candidate experience. Keep it separate from the existing job-analysis setup steps.

### Stage 0 · Application screen
- Add job-analysis-linked yes/no minimum qualifications. Any degree requirement includes **or equivalent experience**.
- Add four training-and-experience questions, each with written 0–3 anchors. Show the rating separately; Stage 0 is a pass/fail hurdle and never contributes to the overall score.
- Let authorized staff review and approve the screening criteria before launch. Do not invent universal qualification thresholds or imply demo thresholds are validated hiring standards.
- Give reviewers a candidate-ID-only application projection excluding name, photo, address, graduation dates and school names—not merely hidden columns.
- A failed screen cannot receive access to Stage 1.

### Stage 1 · Online assessment · about 25 minutes
- **Reasoning questions:** 12 real, job-relevant, multi-step items: four numerical, four verbal and four logical. Vary difficulty and allocate 1–2 minutes per item, about 18 minutes total.
- **Job scenarios:** eight planned scenarios with four options each and an expert-approved scoring key, about seven minutes total. Include at least three complete demo scenarios derived from critical incidents.
- Show one start button, numbered parts, a progress bar and optional breaks between parts. Give one practice question when each part type first begins—not before every reasoning subsection.
- Preserve autosave, resume, randomized presentation, accommodations and locked submissions.
- Score automatically and compare with a separately approved Stage 1 passing score. For this plan, combine reasoning and scenarios in the same 20:25 ratio as their final weights, normalized to 100; display this rule in the test plan.
- On completion show **“Thanks, we'll let you know about next steps within X days.”** Add an editable campaign response-time setting; clearly identify the fictional example value.
- Passing does not reveal the next stage automatically: authorized HR staff issue a **new private Stage 2 link** only for eligible candidates.

### Stage 2 · Hands-on tasks · about 40 minutes
- Two exercises: design a short training module; evaluate a training-results dataset.
- Fold relevant job knowledge into these tasks and remove the standalone job-knowledge test from new plans.
- Give each exercise its own three rubric dimensions with five behavioral anchors. For module design: measurable objectives, practice aligned with objectives, and assessment checking the objective.
- Retain two independent blind raters and require third-rater resolution when any dimension differs by two or more points.
- Advance only after required ratings and disagreements are complete. Stage 2 remains a separate invitation and cannot be reached using a Stage 1 token.

### Stage 3 · Structured interview · about 30 minutes
- Five consistent behavioral questions for finalists: adaptability, cooperation, dependability, and two additional behaviors grounded in critical incidents.
- Each question has a 1–5 anchored scale and notes. Use the same approved questions for everyone in a campaign.
- Add a printable hiring-manager guide with intro script, questions, follow-up prompts, scales, notes and “what not to ask,” including age, family, health and religion.
- Authorized hiring managers record interview ratings for their assigned roles without gaining permission to edit tests or prior scores. Keep interview scoring and hiring decisions distinct and audited.

## 3. Scoring and item quality
- For candidates who complete Stage 3, calculate **Hands-on tasks 40% + Job scenarios 25% + Reasoning 20% + Structured interview 15%**.
- Keep scores on a comparable 0–100 scale, retain the underlying anchored ratings, and do not calculate or display an overall score for earlier stages or incomplete finalists.
- Enforce a single scoring assignment per skill; **Mathematical Reasoning** contributes through reasoning questions only. The dataset task can assess interpreting training outcomes without counting mathematical reasoning again.
- Replace generic explanations with item-specific reasoning, evidence links and approved scoring rationale. Answer keys and explanations stay out of candidate payloads while testing.
- Derive displayed stage totals from item time allocations so the test plan and candidate timers agree.
- Use accurate demo counts: **12 reasoning items, four per area**, and **Demo shows 3 of 8 scenarios**. Your requested minimum of four real items per reasoning area means all 12 reasoning items are present, so a global “4 of 12” label would be misleading.

## 4. Pipeline and complete fictional stories
Show the stage reached and each completed hurdle's pass/fail outcome, with pending states for incomplete reviews. Show an overall score only for completed finalists.

Use five fictional candidates:
- **Avery:** screened out at Stage 0, with a job-related reason.
- **Jordan:** passes Stage 0, below the Stage 1 passing score.
- **Sam Patel:** passes Stage 1, in Stage 2 rater review, with a two-point disagreement and third-rater flag.
- **Riley Brooks:** finalist with completed hands-on and interview ratings; one recorded decision by Daniel Okafor, **Advance to final conversation**, with a short reason.
- **Casey Morgan:** finalist with completed interview ratings and no recorded decision yet.

Keep optional fairness-group reporting after submission, segregated from raters and hiring managers. Candidate headers continue to show the deadline for their own invitation, including new stage invitations—not the campaign end date alone.

## Technical implementation
- Extend the existing versioned assessment model with screening criteria, stage configuration, stage-specific passing rules and interview kits. Preserve previously approved batteries and historical attempts rather than silently changing their scoring.
- Add persistent stage attempts, screening outcomes and invitation lineage using additive Lovable Cloud changes. Stage-specific tokens are hashed and return only the authorized stage's questions.
- Enforce stage order, eligibility, submission locks, two-rater completion, finalist-only scoring and permitted interview actions in transactional database functions as well as app controls. Retain HR approval guards, protected roles, audit history and race-prevention locks.
- Reuse the existing candidate, pipeline, blind-scoring, test-plan and builder screens; share stage/scoring helpers between live and isolated demo behavior.
- Add glossary and interview-guide pages with unique page titles and descriptions. Preserve current route URLs where practical and redirect retired legacy entry points.
- No new AI connector or authentication model is needed for this work.

## Verification
- Add focused tests for degree equivalence, four 0–3 experience ratings, Stage 0 exclusion from scoring, stage order and token isolation, passing-score gates, 40/25/20/15 weights, finalist-only totals, mathematical-reasoning single counting, rater disagreement, item counts/timing and blind projections.
- Test database boundaries so direct requests cannot skip hurdles, access another stage, reveal identity or answer keys, or change locked scores.
- Walk the demo end to end: screening failure, Stage 1 failure, eligible new Stage 2 link, autosave/resume, rater disagreement resolution, finalist interview ratings, overall score and recorded decision.
- Check desktop and phone layouts, long-title wrapping, tooltips, glossary/footer navigation and the printed interview guide.
- Recheck whether a real authorized account and verified email sender are available. If not, complete demo and database-boundary verification and explicitly report live account/email walkthroughs as unverified.