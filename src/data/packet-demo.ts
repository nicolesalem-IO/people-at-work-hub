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
      task: "Design orientation and training programs; assess training needs",
      skill: "Education and Training",
      testedIn: "Work sample",
      lines: "Objectives, practice, check",
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
    { skill: "Extra exercises", reason: "No evidence that several similar exercises predict better than one well-built one." },
  ],
  workSample: {
    title: "Design a 30-minute module",
    minutes: 25,
    task: "Design orientation and training programs; assess training needs",
    skill: "Education and Training",
    materials:
      "Northwind's scheduling team has 12 new schedulers. In a two-week audit, 6 of 12 routed urgent patient requests to the right queue. Supervisors say people know the policy but freeze when two requests arrive at once. You have one 30-minute slot and a room with a whiteboard.",
    instructions:
      "Outline a 30-minute module. Include (1) two measurable learning objectives, (2) one practice activity, with timing, and (3) a quick check that shows whether each objective was met.",
    rubric: [
      {
        id: "objectives",
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
    ],
  },
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
