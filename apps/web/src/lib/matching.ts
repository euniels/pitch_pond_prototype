import type {
  InvestorThesis,
  MatchFactor,
  MatchResult,
  VentureProfile,
} from "./domain";
import { z } from "zod";

export const matchRubricSchema = z
  .object({
    version: z.string().min(1).max(40),
    weights: z.object({
      sector: z.number().int().nonnegative(),
      stage: z.number().int().nonnegative(),
      ticket: z.number().int().nonnegative(),
      traction: z.number().int().nonnegative(),
      geography: z.number().int().nonnegative(),
      impact: z.number().int().nonnegative(),
      risk: z.number().int().nonnegative(),
    }),
  })
  .refine(
    ({ weights }) =>
      Object.values(weights).reduce((sum, value) => sum + value, 0) === 100,
    { message: "Matching rubric weights must total 100." },
  );

export type MatchRubric = z.infer<typeof matchRubricSchema>;

export const DEFAULT_MATCH_RUBRIC: MatchRubric = {
  version: "2026.1",
  weights: {
    sector: 20,
    stage: 20,
    ticket: 20,
    traction: 15,
    geography: 10,
    impact: 10,
    risk: 5,
  },
};

function factor(
  key: MatchFactor["key"],
  label: string,
  matched: boolean,
  reason: string,
  weights: MatchRubric["weights"],
): MatchFactor {
  return {
    key,
    label,
    weight: weights[key],
    score: matched ? weights[key] : 0,
    reason,
    matched,
  };
}

export function calculateMatch(
  venture: VentureProfile,
  thesis: InvestorThesis,
  rubric: MatchRubric = DEFAULT_MATCH_RUBRIC,
): MatchResult {
  const blockedBy: string[] = [];
  if (!venture.consentToMatch)
    blockedBy.push("The founder has not consented to matching.");
  if (
    thesis.excludedSectors.some(
      (value) => value.toLowerCase() === venture.sector.toLowerCase(),
    )
  )
    blockedBy.push("The venture is in an excluded sector.");

  const ticketMatched =
    venture.fundingNeedMin <= thesis.ticketMax &&
    venture.fundingNeedMax >= thesis.ticketMin;
  const sharedImpact = venture.impactGoals.filter((goal) =>
    thesis.impactGoals.includes(goal),
  );
  const factors = [
    factor(
      "sector",
      "Sector",
      thesis.sectors.includes(venture.sector),
      thesis.sectors.includes(venture.sector)
        ? `${venture.sector} is in the thesis.`
        : `${venture.sector} is outside the selected sectors.`,
      rubric.weights,
    ),
    factor(
      "stage",
      "Stage",
      thesis.stages.includes(venture.stage),
      thesis.stages.includes(venture.stage)
        ? `${venture.stage} is a preferred stage.`
        : `${venture.stage} is outside the preferred stages.`,
      rubric.weights,
    ),
    factor(
      "ticket",
      "Funding range",
      ticketMatched,
      ticketMatched
        ? "The requested range overlaps the thesis ticket."
        : "The requested range does not overlap the thesis ticket.",
      rubric.weights,
    ),
    factor(
      "traction",
      "Traction",
      venture.tractionLevel >= thesis.minimumTraction,
      venture.tractionLevel >= thesis.minimumTraction
        ? "The stated traction meets the explicit threshold."
        : "The stated traction is below the threshold.",
      rubric.weights,
    ),
    factor(
      "geography",
      "Geography",
      thesis.regions.length === 0 || thesis.regions.includes(venture.region),
      thesis.regions.length === 0 || thesis.regions.includes(venture.region)
        ? `${venture.region} is supported.`
        : `${venture.region} is outside the current thesis.`,
      rubric.weights,
    ),
    factor(
      "impact",
      "Impact goals",
      thesis.impactGoals.length === 0 || sharedImpact.length > 0,
      thesis.impactGoals.length === 0
        ? "No impact filter was required."
        : sharedImpact.length
          ? `Shared goals: ${sharedImpact.join(", ")}.`
          : "No selected impact goal overlaps.",
      rubric.weights,
    ),
    factor(
      "risk",
      "Risk tolerance",
      venture.riskLevel <= thesis.riskTolerance,
      venture.riskLevel <= thesis.riskTolerance
        ? "The declared risk level is within tolerance."
        : "The declared risk level exceeds tolerance.",
      rubric.weights,
    ),
  ];
  const score = blockedBy.length
    ? 0
    : factors.reduce((sum, item) => sum + item.score, 0);
  return {
    eligible: blockedBy.length === 0,
    score,
    rubricVersion: rubric.version,
    factors,
    reasons: factors.filter((item) => item.matched).map((item) => item.reason),
    mismatches: factors
      .filter((item) => !item.matched)
      .map((item) => item.reason),
    blockedBy,
  };
}
