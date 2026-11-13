// AI shadow ratings. The AI rates the same items as the people (expert ratings or work sample lines),
// but nobody rating can see it and it never counts. These checks decide when it has earned trust.
// Even when trusted, the plan is for it to stand in for one human rater at most, never all of them,
// and disagreements still go to a person.

export interface ShadowPair {
  item: string; // what was rated (task id, or candidate + rubric line)
  role: string; // the job, so trust is earned across several roles, not one
  human: number; // people's consensus score, 1-5
  ai: number; // AI score, 1-5
  aiRerun?: number; // the AI scoring the same thing again, for consistency
  group?: string; // optional self-reported group, for candidate scores only
}

export const SHADOW_RULES = {
  minPairs: 100,
  minRoles: 3,
  withinOne: 0.8, // share of AI scores within 1 point of the people
  consistency: 0.95, // share of reruns within 1 point of the first run
  maxGroupDrop: 0.1, // agreement can't fall more than 10 points for any group
} as const;

const within = (a: number, b: number) => Math.abs(a - b) <= 1;
const share = (xs: boolean[]) => (xs.length ? xs.filter(Boolean).length / xs.length : 0);

export function shadowReport(pairs: ShadowPair[], humanAgreement?: number) {
  const agree = share(pairs.map((p) => within(p.human, p.ai)));
  const exact = share(pairs.map((p) => p.human === p.ai));
  const reruns = pairs.filter((p) => typeof p.aiRerun === "number");
  const consistency = reruns.length ? share(reruns.map((p) => within(p.ai, p.aiRerun!))) : null;
  const roles = new Set(pairs.map((p) => p.role)).size;
  const groups = [...new Set(pairs.map((p) => p.group).filter((g): g is string => Boolean(g)))].map((g) => {
    const ps = pairs.filter((p) => p.group === g);
    return { group: g, pairs: ps.length, agreement: share(ps.map((p) => within(p.human, p.ai))) };
  });
  const reasons: string[] = [];
  if (pairs.length < SHADOW_RULES.minPairs) reasons.push(`Needs ${SHADOW_RULES.minPairs} comparisons (has ${pairs.length}).`);
  if (roles < SHADOW_RULES.minRoles) reasons.push(`Needs ${SHADOW_RULES.minRoles} different roles (has ${roles}).`);
  if (agree < SHADOW_RULES.withinOne) reasons.push(`Within-1-point agreement is ${Math.round(agree * 100)}%; needs ${SHADOW_RULES.withinOne * 100}%.`);
  if (humanAgreement !== undefined && agree < humanAgreement)
    reasons.push(`Agrees with people less often than people agree with each other (${Math.round(agree * 100)}% vs ${Math.round(humanAgreement * 100)}%).`);
  if (consistency === null) reasons.push("No reruns yet to check that the AI gives the same score twice.");
  else if (consistency < SHADOW_RULES.consistency) reasons.push(`Gives the same score on a rerun ${Math.round(consistency * 100)}% of the time; needs ${SHADOW_RULES.consistency * 100}%.`);
  for (const g of groups)
    if (agree - g.agreement > SHADOW_RULES.maxGroupDrop) reasons.push(`Agreement drops to ${Math.round(g.agreement * 100)}% for one group; it must hold for everyone.`);
  return { pairs: pairs.length, roles, agreement: agree, exact, consistency, groups, trusted: reasons.length === 0, reasons };
}
