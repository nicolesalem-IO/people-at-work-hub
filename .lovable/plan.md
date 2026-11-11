# Welcome and first-run onboarding

## Welcome page
- Make `/` the welcome screen for signed-out visitors and people who have not completed setup; keep returning users on **Your roles**.
- Use your supplied headline, eyebrow, subhead, buttons, four How It Works cards and trust strip.
- Follow the requested asymmetric yellow-image/white-text layout, with square yellow corners, ink pill actions, Manrope headings and DM Sans body. Stack the image above the text on phones.
- Generate a replaceable product illustration showing the blueprint, numerical question and 92% coverage cards, with the supplied alt text. Use large, readable labels and no people.
- **Explore the demo** opens the fictional Northwind Health workspace immediately without sign-in. **Start a role** begins setup.

## Five setup screens
1. **What's your role?** Choose HR / People team, Hiring manager, I-O practitioner or Subject-matter expert.
2. **What are you hiring for?** Save job title, organization and openings; default purpose to Selection.
3. **Find the closest benchmark.** Search O*NET using the title and show three matches with codes and descriptions, plus None of these fit. Clearly distinguish saved/demo matches from verified live results.
4. **Who knows this job best?** Add at least two SMEs, including name, email and incumbent/supervisor type, or use the fictional team. Include the supplied 10–15 minute explanation. Preserve the existing skippable Admin team-invitation step without increasing the five-screen count.
5. **You're set.** Show the yellow checklist band and open the roles workspace.

Every screen gets the yellow progress indicator, Step X of 5, Skip for now, one focused main action and keyboard-accessible choices. Save progress after each screen; skipping preserves the draft.

## SME invitation welcome
- Add a mobile-first private invitation welcome with the requested yellow heading, role name, three bullets and Start rating action.
- Require verification of the invited email before access to real ratings, without a separate account-creation form. Preserve assigned-role restrictions and keep individual live ratings limited to the authorized analyst/Admin and their author.
- Fictional SME links remain explicitly labeled and isolated from real records.

## Empty pages and accessibility
- Audit the roles dashboard, evidence, interviews, ratings, blueprint/builders, candidates and Admin lists. Replace blank tables with a yellow icon, one-line explanation and relevant action.
- Keep ink text on yellow, magenta focus rings, image alt text, predictable focus between setup screens and reduced-motion support.
- Keep long headings and forms readable at 390px, 979px and desktop widths; use fixed desktop/mobile type sizes, not viewport-scaled fonts or negative letter spacing.

## Technical and security details
- Keep the current TanStack routing and design components; add a dedicated dashboard path while preserving existing workspace navigation.
- Persist signed-in onboarding drafts and completion in owner-scoped Cloud records; signed-out drafts use isolated browser storage and cannot grant access.
- The self-selected occupation changes wording and suggested next actions, **not live privileges**. Organization permissions still require Admin-managed roles; never auto-promote someone to HR or Admin.
- Add additive storage, grants, policies and protected save actions for onboarding and verified SME invitations as needed. Candidate and onboarding invite types remain separate.
- Keep real O*NET extraction limitations visible; do not label a saved benchmark as live.
- The candidate pipeline remains in progress and is not replaced by this work.

## Verification and dependencies
- Test first-run, saved-step resume, skip, demo entry, completed-user entry, SME invitation access and permission boundaries.
- Walk setup and candidate flows on desktop and phone, verifying saved values read back and no overflow.
- Candidate demo autosave/resume and the current 35 workflow tests pass. Live signed-in verification remains blocked by zero real accounts; invitation emails also require a verified sender domain.
- After approval, finish the remaining candidate scoring/results checks alongside onboarding. Report any real-account, email or O*NET limitations rather than treating demo checks as live verification.