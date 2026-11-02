import { z } from "zod";

const money = z.coerce.number().int().min(0).max(1_000_000_000);

export const ventureSchema = z
  .object({
    organizationId: z.string().uuid(),
    name: z.string().trim().min(3).max(100),
    tagline: z.string().trim().min(20).max(180),
    sector: z.string().trim().min(2).max(80),
    stage: z.string().trim().min(2).max(60),
    region: z.string().trim().min(2).max(80),
    city: z.string().trim().max(80).optional(),
    fundingNeedMin: money,
    fundingNeedMax: money,
    tractionLevel: z.coerce.number().int().min(0).max(5),
    riskLevel: z.coerce.number().int().min(1).max(5),
    impactGoals: z.array(z.string().max(40)).max(10),
    consentToMatch: z.boolean(),
  })
  .refine((value) => value.fundingNeedMax >= value.fundingNeedMin, {
    message: "Maximum funding need must be at least the minimum.",
    path: ["fundingNeedMax"],
  });

export const thesisSchema = z
  .object({
    organizationId: z.string().uuid().nullable().optional(),
    sectors: z.array(z.string().min(2).max(80)).min(1).max(20),
    stages: z.array(z.string().min(2).max(60)).min(1).max(10),
    regions: z.array(z.string().min(2).max(80)).max(20),
    ticketMin: money,
    ticketMax: money,
    minimumTraction: z.number().int().min(0).max(5),
    impactGoals: z.array(z.string().max(40)).max(10),
    riskTolerance: z.number().int().min(1).max(5),
    excludedSectors: z.array(z.string().max(80)).max(20),
    mentorshipOnly: z.boolean(),
  })
  .refine((value) => value.ticketMax >= value.ticketMin, {
    message: "Maximum ticket must be at least the minimum.",
    path: ["ticketMax"],
  });

export const pilotApplicationSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().email().max(180),
  organization: z.string().trim().min(2).max(140),
  role: z.enum(["founder", "investor_mentor", "institution"]),
  region: z.string().trim().min(2).max(80),
  goals: z.string().trim().min(20).max(1200),
  consent: z.literal(true),
  website: z.string().max(0).optional(),
});

export const invitationSchema = z.object({
  email: z.string().email().max(180),
  role: z.enum([
    "founder",
    "investor_mentor",
    "institution_reviewer",
    "institution_manager",
    "platform_admin",
  ]),
  organizationId: z.string().uuid().nullable(),
});

export const readinessSectionSchema = z.object({
  ventureId: z.string().uuid(),
  dimension: z.enum([
    "problem",
    "market",
    "solution",
    "traction",
    "team",
    "business_model",
    "use_of_funds",
    "financial_readiness",
    "legal_readiness",
  ]),
  summary: z.string().trim().min(20).max(4000),
});

export const claimSchema = z.object({
  ventureId: z.string().uuid(),
  dimension: readinessSectionSchema.shape.dimension,
  statement: z.string().trim().min(20).max(4000),
});

export const milestoneSchema = z.object({
  ventureId: z.string().uuid(),
  title: z.string().trim().min(3).max(180),
  occurredOn: z.string().date().or(z.literal("")),
  status: z.enum(["planned", "achieved"]),
  evidenceId: z.string().uuid().or(z.literal("")),
});

export const claimEvidenceLinkSchema = z.object({
  claimId: z.string().uuid(),
  evidenceId: z.string().uuid(),
});

export const metricCategorySchema = z.enum([
  "revenue",
  "active_customers",
  "retention",
  "gross_margin",
  "cash_runway",
  "product_milestone",
  "readiness",
  "evidence_coverage",
  "custom",
]);

export const metricUnitSchema = z.enum([
  "php",
  "count",
  "percent",
  "months",
  "score",
  "custom",
]);

export const ventureMetricSchema = z.object({
  ventureId: z.string().uuid(),
  key: z.string().trim().regex(/^[a-z0-9_]{2,60}$/),
  name: z.string().trim().min(2).max(100),
  category: metricCategorySchema,
  unit: metricUnitSchema,
  direction: z.enum(["increase", "decrease"]),
  cadence: z.enum(["weekly", "monthly", "quarterly"]),
  privacyClassification: z.enum(["indexed", "exact"]),
});

const projectionValue = z.coerce.number().finite().min(-1_000_000_000).max(1_000_000_000);
const optionalProjectionAssumption = z.preprocess(
  (value) => (value === "" || value === null ? undefined : value),
  z.coerce.number().finite().min(0).max(1_000_000_000).optional(),
);
const optionalPercentageAssumption = z.preprocess(
  (value) => (value === "" || value === null ? undefined : value),
  z.coerce.number().finite().min(0).max(100).optional(),
);

export const metricObservationSchema = z.object({
  ventureId: z.string().uuid(),
  metricId: z.string().uuid(),
  value: projectionValue,
  observedOn: z.string().date(),
  verificationState: z.enum(["self_reported", "evidence_linked", "reviewed"]),
  evidenceId: z.string().uuid().or(z.literal("")),
});

export const projectionGoalSchema = z
  .object({
    ventureId: z.string().uuid(),
    metricId: z.string().uuid(),
    label: z.string().trim().min(3).max(140),
    baselineValue: projectionValue,
    targetValue: projectionValue,
    weight: z.coerce.number().int().min(1).max(100),
    targetDate: z.string().date(),
    expectedMonthlyChange: projectionValue,
    monthlyVolatility: z.coerce.number().finite().min(0).max(1_000_000_000),
    customerAcquisitionPerMonth: optionalProjectionAssumption,
    retentionPercent: optionalPercentageAssumption,
    monthlyBurnAmount: optionalProjectionAssumption,
    milestoneReliability: optionalPercentageAssumption,
    evidenceCadencePerMonth: optionalProjectionAssumption,
  })
  .refine((value) => value.baselineValue !== value.targetValue, {
    message: "Target must differ from the baseline.",
    path: ["targetValue"],
  });

export const projectionCalculationSchema = z.object({
  goalId: z.string().uuid(),
  scenario: z.enum(["cautious", "baseline", "accelerated"]),
  asOfDate: z.string().date().optional(),
});

export const projectionShareSchema = z.object({
  runId: z.string().uuid(),
  ventureId: z.string().uuid(),
  recipientId: z.string().uuid(),
  visibility: z.enum(["indexed", "exact"]),
  matchId: z.string().uuid().or(z.literal("")),
  introductionId: z.string().uuid().or(z.literal("")),
  expiresAt: z.string().datetime(),
});
