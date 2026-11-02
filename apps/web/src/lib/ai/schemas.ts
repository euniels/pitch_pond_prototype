import { z } from "zod";

export const readinessAdviceSchema = z.object({
  summary: z.string().max(800),
  gaps: z
    .array(
      z.object({
        dimension: z.string(),
        observation: z.string().max(300),
        nextStep: z.string().max(300),
        evidenceIds: z.array(z.string()),
      }),
    )
    .max(9),
  limitations: z.array(z.string().max(240)).max(5),
});

export const evidenceSummarySchema = z.object({
  title: z.string().max(140),
  summary: z.string().max(1200),
  supportedClaims: z
    .array(
      z.object({
        claim: z.string().max(300),
        evidenceIds: z.array(z.string()).min(1),
      }),
    )
    .max(12),
  unresolvedQuestions: z.array(z.string().max(300)).max(10),
  limitations: z.array(z.string().max(240)).max(5),
});

export const matchNarrativeSchema = z.object({
  headline: z.string().max(160),
  fitSummary: z.string().max(700),
  strengths: z.array(z.string().max(240)).max(7),
  mismatches: z.array(z.string().max(240)).max(7),
  questions: z.array(z.string().max(240)).max(7),
});

export const projectionExplanationSchema = z.object({
  summary: z.string().max(800),
  positiveDrivers: z.array(z.string().max(260)).max(6),
  negativeDrivers: z.array(z.string().max(260)).max(6),
  sensitivity: z.array(z.string().max(260)).max(6),
  missingOrStaleData: z.array(z.string().max(260)).max(8),
  evidenceBackedRisks: z
    .array(
      z.object({
        risk: z.string().max(300),
        evidenceIds: z.array(z.string()).max(10),
      }).strict(),
    )
    .max(8),
  nextActions: z.array(z.string().max(260)).max(8),
  investorQuestions: z.array(z.string().max(260)).max(8),
  limitations: z.array(z.string().max(260)).max(6),
}).strict();

export type AiPurpose =
  | "readiness_review"
  | "evidence_summary"
  | "match_explanation"
  | "projection_explanation";
