# Testing-focused candidate assessment battery

## End goal
- Replace interview/hiring materials as the workflow destination with a candidate assessment battery: job analysis → test blueprint → test builders → scoring and validity review → HR approval → candidate testing → results for human review.
- Keep the purpose step, evidence, SME ratings, coverage, conflicts and HR review. Preserve your established Nicole Salem styling.
- Remove job evaluation and pay-grade tools from the active workflow. Preserve historical records without offering compensation outputs or deleting saved data.
- No application or database implementation begins until you approve this plan.

## 1. Shorter job analysis
- Begin with purpose and role setup; Selection uses the testing-focused workflow. Other purposes remain recorded and never silently become selection testing.
- Add an official, source-attributed O*NET benchmark layer. No O*NET layer currently exists in the app; this adds it rather than replacing existing data. Use occupation **13-1151.00 — Training and Development Specialists**, retaining source IDs, release, retrieval date and attribution separately from local SME judgments.
- SMEs rate benchmark tasks, knowledge, skills, abilities and tools: **Applies**, **Importance 1–5**, **Frequency 1–5**, **Needed at entry?**, and **Test it / Observe it / Ask about it**.
- Keep only two short interview modules: **critical incidents** and **decision authority**. Saved incidents feed SJT scenarios; authority limits support relevant test contexts.
- Produce the **Testable KSAO list** from applicable KSAOs with importance **≥ 4** and entry requirement **Yes**. Exclude trainable KSAOs from selection tests.
- Display individual SME judgments. Use mean importance for agreed applicable/entry-required KSAOs; disagreements over applicability or entry requirements remain unresolved rather than letting an average or manager override decide inclusion.
- Replace the long module checklist with rating and short-interview coverage, keeping distinct-source counts, limited-source warnings and evidence-linked conflicts. Material conflicts must be resolved before progression to final approval.

## 2. Test Blueprint page
- Show a **KSAO × assessment method** matrix with assignments, coverage, importance-derived method weights and estimated candidate time.
- Methods: custom skills/work sample, aptitude, SJT, job knowledge and structured interview.
- Split each KSAO's importance weight across its assigned methods and normalize to 100%, avoiding double-counting when multiple methods cover the same KSAO. Analysts may adjust weights with a recorded rationale.
- Allow structured interview only where a KSAO cannot reasonably be tested or observed, with justification; aim for **≤ 20%** total weight.
- Warn for interview weight **> 20%** and uncovered KSAOs. Uncovered testable KSAOs block HR submission; excess interview weight requires an explicit rationale in review rather than silently changing weights.

## 3. Test builders
- **Custom skills:** generate **2–3** work samples from the highest-rated tasks. Each has instructions, time limit, materials, task/KSAO links and behaviorally anchored **1–5** rubric levels for each dimension.
- Demo exercises: outline a 30-minute training module from a needs assessment; analyze training-results data and recommend next steps; revise a weak facilitator guide.
- Require **two independent raters** per work sample; flag dimension-score differences **> 1 point** and require documented reconciliation before finalized results.
- **Aptitude:** numerical reasoning in training budgets/completion/cost contexts, verbal reasoning using policy passages, and logical/abstract reasoning. Include timed sections and a practice item.
- AI drafts original multiple-choice items, never reproducing commercial tests. Store stem, options, correct answer, explanation, linked KSAO/O*NET ability, estimated difficulty and **Draft / SME-approved / Retired** status.
- **Job knowledge:** add original, evidence-linked knowledge items using the same item-review and scoring controls.
- Only SME-approved items may enter the candidate battery. A changed item loses its prior approval for new use.
- **SJT:** turn each saved critical incident into a scenario with **four** response options. SMEs rate each option's effectiveness **1–5**. Require an agreed, versioned key; calculate agreement with that key, with the scoring formula visible to reviewers.
- Preserve a small structured-interview option for justified, otherwise untestable KSAOs, with anchored human scoring.

## 4. Scoring and cut scores
- Auto-score aptitude and knowledge against approved answer keys; score SJT against its SME key. Human raters score work samples and structured interviews.
- Normalize method scores and apply blueprint weights; show a candidate profile by **KSAO and method**, not only a composite number. Pending human scoring is visibly incomplete, never treated as zero.
- Add a simple **Angoff** exercise: each SME estimates **0–100%** of minimally qualified candidates expected to answer each scored objective item correctly. Average estimates and aggregate using the battery's scoring weights; retain individual estimates, dates and cut-score rationale.
- Keep human-scored work-sample standards separate and explicitly reviewed; do not pretend their rubrics are right/wrong Angoff items.
- Rank and summarize completed profiles, while displaying **“Recommendation requires human review.”** The app never makes or executes a hiring decision.

## 5. Fairness and validity
- Generate a content-validity evidence report linking **section/item → KSAO → O*NET task or ability → SME rating**, with approvals and dates. This documents content alignment; it does not claim the battery is psychometrically validated.
- Add an adverse-impact pilot view using optional, self-reported groups stored separately from candidate answers and scores. Raters cannot see group membership; only authorized fairness/HR reviewers can access the separate report.
- Compare group pass rates to the highest eligible group rate. Flag ratios **< 0.80** under the four-fifths rule; show counts, small-sample limitations and undefined/no-reference cases without claiming legal compliance.
- Flag estimated reading demands above the recorded job requirement and time limits without a job-based rationale. These are review flags, not AI determinations of accessibility or validity.
- Display: **“Cognitive ability tests predict performance well but can produce adverse impact; balance them with work samples and SJTs and review pilot results before use.”**

## 6. HR approval and candidate mode
- Submit the **blueprint, items, scoring keys, rubrics, cut scores and validity report** as one versioned package. Preserve the analysis review checkpoint, but require separate approval of the complete battery before release.
- Require complete coverage, no blocking conflicts, SME-approved active items and completed scoring standards before submission. HR can approve, reject or request revision.
- Nothing goes live to candidates before HR approval. Changes to approved battery content require a new version and renewed approval; existing candidate attempts remain bound to their original version.
- Candidate-specific links open welcome, time estimate, **“Need extra time or a different format?”**, practice, timed sections, saved progress and submission.
- Accommodation requests go to authorized staff. Approved extra time or alternate format is applied before the attempt; requesting an accommodation does not affect scores.
- Use server-authoritative timing, resume after refresh and safe repeated submissions. Never expose answer keys, SME notes or other candidates' results through candidate pages or requests.
- Keep pages plain-language, mobile-friendly, keyboard-accessible and screen-reader labelled.

## 7. Fictional demonstration
- Use **Learning & Development Specialist** at **Northwind Health (fictional)**, purpose **Selection**, benchmark **13-1151.00**.
- SMEs: **Priya Shah (incumbent)** and **Daniel Okafor (L&D Manager)**, both fictional.
- Include realistic fictional ratings, short interviews, blueprint, exercises, approved objective items, SME keys, two-rater scores, Angoff estimates and review history.
- Seed **five fictional completed candidates** so Results and pilot fairness views have data. Label all candidates, scores, local judgments and demonstration approvals as fictional; official O*NET benchmark content remains attributed, not labelled invented.
- Keep prior fictional roles and saved analyses intact as historical records. Signed-out practitioner pages show the new fictional preview; real saving and release require authorized access.

## Technical implementation
- Extend the existing Lovable Cloud records additively for benchmark data, ratings, battery versions, methods/items/rubrics, approvals, candidate invitations/attempts, answers, rater scores, Angoff estimates and restricted demographic records.
- Reuse evidence/conflict/audit structures where safe. Enforce approval, version immutability, same-role evidence, item eligibility and candidate ownership in database rules as well as server checks; serialize approval/edit races.
- Keep practitioner authentication and role assignments unchanged. Add protected SME/rater/reviewer access without automatically granting privileges. Candidate invitation tokens are narrowly scoped, expiring and revocable, with no general workspace access.
- Use deterministic, tested coverage and scoring functions. AI only drafts content; it cannot approve items, set eligibility, authorize release or make hiring decisions.
- Keep AI calls through AI Gateway and revalidate evidence references server-side. Claude remains subject to workspace permission; do not silently change the requested provider.
- Import the official O*NET downloadable database with its license/attribution, using a versioned occupation extract rather than inventing benchmark records or requiring an unconfigured API subscription. Verified sources: [O*NET database](https://www.onetcenter.org/database.html), [occupation summary](https://www.onetonline.org/link/summary/13-1151.00).
- Add dedicated Blueprint, Builders, Results, Fairness/Validity, HR Review and Candidate pages, with unique page metadata; keep existing published URLs working as historical views or redirects.

## Verification before completion
- Test importance **≥ 4**, entry-only inclusion, excluded trainable KSAOs, **1–5** ratings, coverage, distinct-source counts and conflicts.
- Test weight normalization, uncovered KSAOs, interview-only justification and the **> 20%** warning.
- Test SME item approval, **four-option** SJT keys, objective scoring, two-rater requirements, disagreement **> 1**, Angoff **0–100%**, cut scores and incomplete-result handling.
- Test adverse-impact calculations including the **0.80** boundary, missing groups, zero reference rates and small samples; verify demographic records are inaccessible to raters and candidates.
- Exercise authorized save/resume → review → battery approval → invitation → practice/timed test → refresh/resume → submit → rater scoring → candidate profile. Verify direct requests cannot bypass approval, timing, ownership or answer-key protection.
- Check desktop/phone layouts, keyboard flows, screen-reader labels, persistence, existing regressions and error logs. Report any access-dependent checks that remain blocked rather than calling them verified.

## Approval
- Approving this plan authorizes the application and database changes above. Until then, the current app stays unchanged.