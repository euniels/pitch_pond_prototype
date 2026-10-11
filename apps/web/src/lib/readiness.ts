import {
  READINESS_DIMENSIONS,
  type ReadinessDimension,
  type ReadinessItem,
  type ReadinessState,
} from "./domain";

export const readinessLabels: Record<ReadinessDimension, string> = {
  problem: "Problem clarity",
  market: "Market evidence",
  solution: "Solution readiness",
  traction: "Traction",
  team: "Team",
  business_model: "Business model",
  use_of_funds: "Use of funds",
  financial_readiness: "Financial readiness",
  legal_readiness: "Legal & business readiness",
};

export function deriveReadinessState(
  completedFields: number,
  requiredFields: number,
  evidenceCount: number,
  reviewed = false,
): ReadinessState {
  if (reviewed && completedFields >= requiredFields && evidenceCount > 0)
    return "reviewed";
  if (completedFields >= requiredFields && evidenceCount > 0)
    return "evidence_linked";
  if (completedFields > 0 || evidenceCount > 0) return "in_progress";
  return "not_started";
}

export function readinessCompletion(items: ReadinessItem[]) {
  const totals = items.reduce(
    (acc, item) => ({
      completed:
        acc.completed + Math.min(item.completedFields, item.requiredFields),
      required: acc.required + item.requiredFields,
    }),
    { completed: 0, required: 0 },
  );
  return totals.required
    ? Math.round((totals.completed / totals.required) * 100)
    : 0;
}

export function evidenceCoverage(items: ReadinessItem[]) {
  return Math.round(
    (items.filter((item) => item.evidenceCount > 0).length /
      Math.max(items.length, 1)) *
      100,
  );
}

export function createEmptyReadiness(): ReadinessItem[] {
  return READINESS_DIMENSIONS.map((dimension) => ({
    dimension,
    label: readinessLabels[dimension],
    state: "not_started",
    completedFields: 0,
    requiredFields: 3,
    evidenceCount: 0,
  }));
}
