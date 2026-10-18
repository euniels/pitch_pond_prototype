export type ProjectionScenario = "cautious" | "baseline" | "accelerated";

export type ProjectionInputs = {
  currentReadiness: number;
  currentEvidence: number;
  horizonMonths: 6 | 12 | 18 | 24;
  monthlyReadinessGain: number;
  evidencePerQuarter: number;
  milestoneReliability: number;
};

export type ProjectionPoint = {
  month: number;
  readiness: number;
  lowerReadiness: number;
  upperReadiness: number;
  evidence: number;
};

export const projectionPresets: Record<
  ProjectionScenario,
  Pick<ProjectionInputs, "monthlyReadinessGain" | "evidencePerQuarter" | "milestoneReliability">
> = {
  cautious: {
    monthlyReadinessGain: 0.6,
    evidencePerQuarter: 1,
    milestoneReliability: 45,
  },
  baseline: {
    monthlyReadinessGain: 1.25,
    evidencePerQuarter: 3,
    milestoneReliability: 65,
  },
  accelerated: {
    monthlyReadinessGain: 2,
    evidencePerQuarter: 5,
    milestoneReliability: 82,
  },
};

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

export function calculateProjection(inputs: ProjectionInputs) {
  const points: ProjectionPoint[] = [];
  const uncertaintyPerMonth = 0.32 + (100 - inputs.milestoneReliability) / 260;

  for (let month = 0; month <= inputs.horizonMonths; month += 3) {
    const taper = 1 - (inputs.currentReadiness / 100) * 0.38;
    const projectedGain = month * inputs.monthlyReadinessGain * taper;
    const readiness = clamp(inputs.currentReadiness + projectedGain, 0, 96);
    const uncertainty = month * uncertaintyPerMonth;
    points.push({
      month,
      readiness: Math.round(readiness),
      lowerReadiness: Math.round(clamp(readiness - uncertainty, 0, 96)),
      upperReadiness: Math.round(clamp(readiness + uncertainty, 0, 96)),
      evidence: Math.round(
        inputs.currentEvidence + (month / 3) * inputs.evidencePerQuarter,
      ),
    });
  }

  const final = points.at(-1)!;
  const projectedMilestones = Math.max(
    1,
    Math.round((inputs.horizonMonths / 6) * (inputs.milestoneReliability / 100)),
  );
  const confidence =
    inputs.currentEvidence >= 18 && inputs.milestoneReliability >= 70
      ? "Stronger evidence base"
      : inputs.currentEvidence >= 11 && inputs.milestoneReliability >= 50
        ? "Developing evidence base"
        : "Early evidence base";

  return {
    points,
    final,
    projectedMilestones,
    confidence,
    readinessGain: final.readiness - inputs.currentReadiness,
    evidenceGain: final.evidence - inputs.currentEvidence,
  };
}
