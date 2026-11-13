import type { PacketData } from "@/lib/packet";

// Fictional sample packet: Northwind Health, Learning & Development Specialist (O*NET 13-1151.00).
export const packetDemo: PacketData = {
  role: "Learning & Development Specialist",
  organization: "Northwind Health",
  onetCode: "13-1151.00",
  date: "2026-11-12",
  fictional: true,
  chain: [
    {
      task: "Design orientation and training programs; assess training needs; evaluate training effectiveness",
      skill: "Education and Training; Judgment and Decision Making; Writing",
      testedIn: "Skills assessment",
      lines: "Objectives, practice, check, evaluation plan, judgment, clear writing",
    },
    {
      task: "Present information using varied instructional techniques",
      skill: "Instructing",
      testedIn: "Teach-back",
      lines: "Checks understanding, clear and organized, handles confusion",
    },
    {
      task: "Work with managers, instructors and stakeholders",
      skill: "Adaptability, Cooperation, Dependability; Judgment and Decision Making",
      testedIn: "Interview",
      lines: "One anchored line per question",
    },
  ],
  notTested: [
    { skill: "Mathematical Reasoning", reason: "Experts rated it 2.5 of 5, below the day-one bar of 4." },
  ],
  workSample: {
    title: "Learning & Development Specialist: Skills Assessment",
    format: "take_home",
    time: "About 2 hours",
    window: "3 business days from your invitation",
    task: "Design orientation and training programs; assess training needs; monitor and evaluate training effectiveness",
    skill: "Education and Training",
    instructions: [
      "Respond to the scenario below. Keep your answers clear and concise.",
      "Answer every numbered item, using the same part and item numbers as headings so reviewers can find each answer.",
      "Don't put your name, current employer or other identifying details inside the document. Reviewers score responses without names.",
      "Use your own work. You may use notes and references, but don't copy a template or AI-generated text as your answer.",
      "If you need an accommodation, such as more time, reply to your invitation before you start.",
    ],
    submission: {
      format: "One PDF file",
      maxLength: "No more than 3 pages (letter size, 11-point font or larger)",
      fileName: "firstname_lastname_LD.pdf (for example, jordanlee_LD.pdf). The file name is removed before reviewers see it.",
      how: "Upload it through the link in your invitation by 5:00 pm Mountain Time on the due date shown there.",
    },
    scenario:
      "Northwind Health's scheduling team has 12 new schedulers who started this month. In a two-week audit, only 6 of 12 routed urgent patient requests to the correct queue. Supervisors say the new schedulers know the policy but freeze when two requests come in at once. Schedulers can't be off the phones for more than 45 minutes at a time. You have one 30-minute training slot next week, in a room with a whiteboard and a laptop with a projector. As the Learning & Development Specialist, you're responsible for designing the session, checking that it works, and working with the supervisors.",
    parts: [
      {
        title: "Part 1: Training design",
        items: [
          { label: "Learning objectives", detail: "Write two learning objectives for the session. Each should describe something a scheduler will be able to do, and how well.", examples: "e.g., what they'll do, under what conditions, to what standard" },
          { label: "Session outline", detail: "Give a minute-by-minute outline of the 30 minutes, including at least one hands-on practice activity. Say what the trainer does and what the schedulers do in each block." },
          { label: "Check for learning", detail: "Explain how you'll know, before they leave, whether each objective was met, and what happens for anyone who doesn't meet it." },
        ],
      },
      {
        title: "Part 2: Measuring impact",
        items: [
          { label: "Evaluation plan", detail: "Describe 2–3 ways you'll find out, about 60 days later, whether the training worked. Say what you'd compare against, and what result would make you change the session.", examples: "e.g., audit accuracy, time to route, supervisor observations" },
        ],
      },
      {
        title: "Part 3: Written questions",
        intro: "Answer each question in one or two short paragraphs.",
        items: [
          { label: "Pushback", detail: "A supervisor says: \u201cJust send them the policy PDF again. Training takes them off the phones.\u201d How do you respond while keeping the supervisor on your side?" },
          { label: "Mixed results", detail: "Two months later, routing accuracy has improved on two of three shifts but not on the evening shift. What would you look into first, and why?" },
          { label: "A nervous learner", detail: "A new scheduler tells you they're too anxious to practice in front of their peers. How do you adapt the session for them without lowering the standard?" },
        ],
      },
    ],
    rubric: [
      {
        id: "objectives",
        part: "Part 1, item 1",
        name: "Objectives are measurable",
        critical: true,
        anchors: [
          "No objectives, or topics only (“routing policy”)",
          "Goals say “understand” or “know”; nothing a trainer could observe",
          "Two objectives with an observable action; one lacks a standard",
          "Both observable, with a standard; one misses the freezing problem",
          "Both observable, with a standard, aimed at the real gap (“route 5 of 5 mixed requests correctly”)",
        ],
      },
      {
        id: "practice",
        part: "Part 1, item 2",
        name: "Practice matches the problem",
        critical: true,
        anchors: [
          "Lecture or slides only",
          "A quiz or discussion about the policy",
          "Hands-on routing practice, one request at a time",
          "Practice with two requests at once, little feedback",
          "Timed practice with two requests at once, getting harder, with feedback after each round",
        ],
      },
      {
        id: "check",
        part: "Part 1, item 3",
        name: "Check matches each objective",
        critical: false,
        anchors: [
          "No check, or a satisfaction question",
          "Checks recall of the policy",
          "A performance check for one objective",
          "Performance checks for both, no pass standard",
          "A performance check for each objective, with a pass standard and a plan for anyone who misses it",
        ],
      },
      {
        id: "evaluation",
        part: "Part 2",
        name: "Evaluation plan fits the problem",
        critical: false,
        anchors: [
          "No plan, or a satisfaction survey only",
          "Names measures, but they aren't tied to routing accuracy",
          "Two measures tied to routing accuracy",
          "Two or three measures with a timeframe and something to compare against",
          "All of 4, and says which result would change the session",
        ],
      },
      {
        id: "judgment",
        part: "Part 3",
        name: "Judgment with people and results",
        critical: false,
        anchors: [
          "Dismisses the concern or agrees to everything",
          "Responds, but ignores the constraint (phone coverage) or the data",
          "Practical answers that address each situation",
          "Practical, uses evidence, and offers options",
          "All of 4, and plans a follow-up to check it worked",
        ],
      },
      {
        id: "writing",
        part: "Whole document",
        name: "Clear, complete and within length",
        critical: false,
        anchors: [
          "Hard to follow, missing parts, or well over length",
          "All parts there, but disorganized or wordy",
          "Organized, within length, in plain language",
          "Headings match the parts and items; easy to scan",
          "Could be handed to a supervisor as written",
        ],
      },
    ],
  },
  aptitude: [
    {
      name: "Numerical reasoning",
      decision: "not_included",
      reason: "Experts and O*NET rate Mathematical Reasoning 2.5 of 5, below the day-one bar of 4.",
    },
    {
      name: "Verbal reasoning",
      decision: "not_included",
      reason: "Written Comprehension is rated 4.0, but the skills assessment already measures it: candidates read a detailed scenario and respond in writing.",
    },
    {
      name: "Coding",
      decision: "not_included",
      reason: "Programming is rated 1.5 of 5. It isn't part of this job.",
    },
  ],
  teachBack: {
    minutes: 20,
    teachMinutes: 5,
    setup:
      "The candidate teaches 5 minutes of the module they designed. The hiring manager and one rater play new schedulers.",
    confusedLine: "“Sorry, I’m lost. If two calls come in at once, which one do I pick up first?”",
    task: "Present information using varied instructional techniques",
    skill: "Instructing",
    rubric: [
      {
        id: "checks",
        name: "Checks for understanding",
        critical: true,
        anchors: [
          "Talks the whole time; no questions",
          "Only asks “any questions?”",
          "At least one question that makes learners show what they know",
          "Several checks; slows down when an answer is wrong",
          "Learners do the step while the candidate watches, corrects and re-checks",
        ],
      },
      {
        id: "clear",
        name: "Clear and organized",
        critical: false,
        anchors: [
          "Hard to follow; no structure",
          "Some structure, but jumps around or runs well over time",
          "States the goal and mostly follows it in order",
          "Goal, steps and a recap, within 5 minutes",
          "All of 4, with examples from scheduling work",
        ],
      },
      {
        id: "confusion",
        name: "Handles the confused learner",
        critical: false,
        anchors: [
          "Repeats the same words or moves on",
          "Repeats more slowly",
          "Explains it another way",
          "Explains another way and checks it landed",
          "Asks what’s confusing first, uses a new example, checks, and keeps time",
        ],
      },
    ],
  },
  interview: {
    minutes: 20,
    opening:
      "“I’ll ask four questions about past situations. Take a moment to think; specific examples help most. We’ll both take notes so we can be fair to everyone.”",
    questions: [
      {
        id: "1",
        question: "Tell me about a time a training plan had to change at the last minute.",
        followUp: "What did you keep, and what did you drop?",
        measures: "Adaptability",
        anchors: [
          "Blamed others; made no change",
          "Made a change but can’t say why",
          "Adjusted and kept the main learning goal",
          "Adjusted around the goal and told the people affected",
          "Re-prioritized around the goal, explained why to stakeholders, and checked the result afterward",
        ],
      },
      {
        id: "2",
        question: "Describe a project where you relied on someone outside your team.",
        followUp: "How did you handle a disagreement?",
        measures: "Cooperation",
        anchors: [
          "Worked around them or escalated first",
          "Cooperated only when it was easy",
          "Raised the disagreement directly and reached a workable answer",
          "Found what each side needed and agreed on a plan",
          "Built agreement, kept the working relationship, and credited others",
        ],
      },
      {
        id: "3",
        question: "Tell me about a commitment you nearly missed.",
        followUp: "What did you do first?",
        measures: "Dependability",
        anchors: [
          "No ownership; blamed circumstances",
          "Recovered, but told people late",
          "Owned it and delivered, with some warning",
          "Flagged the risk early, then delivered or reset the date",
          "Flagged it early, reset expectations, delivered, and changed how they plan",
        ],
      },
      {
        id: "4",
        question: "Describe a time you said no to a stakeholder’s training request.",
        followUp: "What did you offer instead?",
        measures: "Judgment and Decision Making",
        anchors: [
          "Agreed to everything, or refused flatly",
          "Said no without an alternative",
          "Said no and offered an alternative",
          "Tied the no to the business need and offered a better option",
          "All of 4, the stakeholder agreed, and they followed up on the result",
        ],
      },
    ],
    dontAsk:
      "Age, family or childcare, health or disability, religion, national origin, pregnancy, or anything else not tied to the job. If a candidate raises it, move back to the question.",
  },
};
