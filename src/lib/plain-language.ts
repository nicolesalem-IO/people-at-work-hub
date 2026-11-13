// Plain words on the page, the science one click away. Each entry: the label people see, the
// technical term an I-O psychologist would use, a plain definition, and why it works.
// `legacy` entries stay for tooltips on older screens but aren't listed on the How it works page.
export interface GlossaryTerm {
  label: string;
  technical: string;
  definition: string;
  science?: string;
  legacy?: boolean;
}

export const glossary: readonly GlossaryTerm[] = [
  {
    label: "Skills needed on day one",
    technical: "KSAOs from a job analysis",
    definition: "The knowledge, skills and abilities someone needs the day they start, not ones they'll learn on the job.",
    science: "Testing only what's needed at entry keeps the test fair to people who would learn the rest in training.",
  },
  {
    label: "Expert ratings",
    technical: "Subject matter expert (SME) ratings",
    definition: "People who know the job well rate how important each task and skill is, and whether it's needed on day one.",
    science: "Combining O*NET data with ratings from your own experts ties the test to how the job is really done at your company.",
  },
  {
    label: "Traces to a real task",
    technical: "Content validity",
    definition: "Every exercise and scoring line links back to a task the job actually involves.",
    science: "When a test samples the job itself, that link is the main evidence it's job-related, and it's what you point to if a decision is questioned.",
  },
  {
    label: "Test plan",
    technical: "Test blueprint",
    definition: "The plan for what each step measures, how it's scored and how long it takes.",
  },
  {
    label: "Work sample",
    technical: "Work sample test",
    definition: "Candidates do a short piece of the real job, such as designing a module or handling a case.",
    science: "Doing the work predicts doing the work. Work samples are among the strongest predictors of job performance and tend to show smaller group differences than general aptitude tests.",
  },
  {
    label: "Teach-back",
    technical: "Performance test (live work sample)",
    definition: "Finalists show a skill live, such as teaching part of their own module, while trained people score it.",
  },
  {
    label: "Structured interview",
    technical: "Structured behavioral interview",
    definition: "Every candidate gets the same questions in the same order, scored with the same written guide.",
    science: "Structure is what makes interviews predictive: unstructured conversations rely on impressions and are much less accurate.",
  },
  {
    label: "Scoring guide",
    technical: "Behaviorally anchored rating scale (BARS)",
    definition: "Each score from 1 to 5 is written out as what the work looks like at that level, so raters match the work to a description.",
    science: "Written anchors make scores more consistent between raters and easier to explain than a gut rating.",
  },
  {
    label: "Day-one standard",
    technical: "Minimum competence anchor",
    definition: "A score of 3 means the work meets what you'd accept from a new hire on day one.",
  },
  {
    label: "Critical line",
    technical: "Non-compensatory (conjunctive) standard",
    definition: "A scoring line the job can't do without. A very low score there stops the candidate even if the average is high.",
  },
  {
    label: "Rater practice",
    technical: "Frame-of-reference training (calibration)",
    definition: "Before scoring candidates, raters score sample answers that experts already scored and must land within a point.",
    science: "Practicing on shared examples gives raters the same picture of good work, which reduces rating errors.",
  },
  {
    label: "Blind double rating",
    technical: "Independent ratings and inter-rater reliability",
    definition: "Two raters score each response without names and without seeing each other's scores. A third settles gaps over a point.",
    science: "Two independent raters cancel out individual quirks; tracking how often they agree shows whether the scoring guide is working.",
  },
  {
    label: "Passing score",
    technical: "Cut score",
    definition: "The score needed to move to the next step: an average of 3.0 with no critical line below 2. It isn't a guarantee of job performance.",
  },
  {
    label: "Fairness check",
    technical: "Adverse impact analysis (four-fifths rule)",
    definition: "A comparison of pass rates across optional self-reported groups after each hiring round.",
    science: "If one group passes at less than 80% of the rate of the highest group, the exercise and scoring guide go back to experts for review.",
  },
  {
    label: "Hiring records",
    technical: "Selection documentation",
    definition: "Every score, note, change and decision, kept for 3 years and exportable.",
  },
  {
    label: "Try out & check fairness",
    technical: "Pilot & fairness",
    definition: "Try the test before use, check timing and scoring, and review differences in pass rates.",
    legacy: true,
  },
  {
    label: "Hands-on tasks",
    technical: "Work sample",
    definition: "Exercises that mirror real work and are rated using written scoring guides.",
    legacy: true,
  },
  {
    label: "Job scenarios",
    technical: "Situational judgment",
    definition: "Realistic work situations with responses scored against an expert-approved key.",
    legacy: true,
  },
  {
    label: "Reasoning questions",
    technical: "Aptitude",
    definition: "Numerical, verbal and logical reasoning questions.",
    legacy: true,
  },
  {
    label: "Overall score",
    technical: "Composite",
    definition: "A weighted score across test parts.",
    legacy: true,
  },
];
