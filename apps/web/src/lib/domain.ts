export const READINESS_DIMENSIONS = [
  "problem",
  "market",
  "solution",
  "traction",
  "team",
  "business_model",
  "use_of_funds",
  "financial_readiness",
  "legal_readiness",
] as const;

export type ReadinessDimension = (typeof READINESS_DIMENSIONS)[number];
export type ReadinessState =
  | "not_started"
  | "in_progress"
  | "evidence_linked"
  | "reviewed";
export type MembershipRole =
  | "founder"
  | "investor_mentor"
  | "institution_reviewer"
  | "institution_manager"
  | "platform_admin";
export type PlanCode =
  | "free-founder"
  | "founder-pro"
  | "readiness-sprint"
  | "institution-pilot"
  | "supporter-pilot";

export type ReadinessItem = {
  dimension: ReadinessDimension;
  label: string;
  state: ReadinessState;
  completedFields: number;
  requiredFields: number;
  evidenceCount: number;
};

export type VentureProfile = {
  id: string;
  name: string;
  tagline: string;
  sector: string;
  stage: string;
  region: string;
  city?: string;
  fundingNeedMin: number;
  fundingNeedMax: number;
  tractionLevel: number;
  impactGoals: string[];
  riskLevel: number;
  consentToMatch: boolean;
  readiness: ReadinessItem[];
};

export type InvestorThesis = {
  id: string;
  sectors: string[];
  stages: string[];
  regions: string[];
  ticketMin: number;
  ticketMax: number;
  minimumTraction: number;
  impactGoals: string[];
  riskTolerance: number;
  excludedSectors: string[];
  mentorshipOnly: boolean;
};

export type MatchFactor = {
  key:
    | "sector"
    | "stage"
    | "ticket"
    | "traction"
    | "geography"
    | "impact"
    | "risk";
  label: string;
  weight: number;
  score: number;
  reason: string;
  matched: boolean;
};

export type MatchResult = {
  eligible: boolean;
  score: number;
  rubricVersion: string;
  factors: MatchFactor[];
  reasons: string[];
  mismatches: string[];
  blockedBy: string[];
};

export type BlindVenture = Pick<
  VentureProfile,
  | "id"
  | "tagline"
  | "sector"
  | "stage"
  | "region"
  | "fundingNeedMin"
  | "fundingNeedMax"
  | "tractionLevel"
  | "impactGoals"
  | "readiness"
> & {
  name: "Identity hidden";
  city?: never;
};

export type EvidenceStatus =
  | "quarantined"
  | "scanning"
  | "clean"
  | "rejected"
  | "processing"
  | "ready"
  | "failed";

export type WorkspaceOverview = {
  profileName: string;
  roles: MembershipRole[];
  venture?: VentureProfile;
  matches?: Array<{
    id: string;
    venture: VentureProfile;
    result: MatchResult;
    revealed: boolean;
  }>;
  cohort?: {
    name: string;
    founders: number;
    reviewers: number;
    completion: number;
    introductions: number;
  };
};
