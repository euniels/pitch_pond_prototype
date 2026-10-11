import type { BlindVenture, VentureProfile } from "./domain";

export function redactForBlindReview(venture: VentureProfile): BlindVenture {
  return {
    id: venture.id,
    name: "Identity hidden",
    tagline: venture.tagline,
    sector: venture.sector,
    stage: venture.stage,
    region: venture.region,
    fundingNeedMin: venture.fundingNeedMin,
    fundingNeedMax: venture.fundingNeedMax,
    tractionLevel: venture.tractionLevel,
    impactGoals: [...venture.impactGoals],
    readiness: venture.readiness.map((item) => ({ ...item })),
  };
}
