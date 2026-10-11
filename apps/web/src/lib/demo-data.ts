import type {
  InvestorThesis,
  VentureProfile,
  WorkspaceOverview,
} from "./domain";
import { calculateMatch } from "./matching";

export const demoVenture: VentureProfile = {
  id: "b6278e53-16f2-4bec-b68a-693a6e935d7b",
  name: "Amihan Cold Chain",
  tagline: "Low-cost solar cold storage for small farming cooperatives.",
  sector: "Climate technology",
  stage: "Early revenue",
  region: "CALABARZON",
  city: "Calamba",
  fundingNeedMin: 1500000,
  fundingNeedMax: 3000000,
  tractionLevel: 3,
  impactGoals: ["SDG 8", "SDG 9"],
  riskLevel: 3,
  consentToMatch: true,
  readiness: [
    ["problem", "Problem clarity", "reviewed", 3, 3, 4],
    ["market", "Market evidence", "evidence_linked", 3, 3, 3],
    ["solution", "Solution readiness", "reviewed", 3, 3, 5],
    ["traction", "Traction", "evidence_linked", 3, 3, 3],
    ["team", "Team", "in_progress", 2, 3, 1],
    ["business_model", "Business model", "evidence_linked", 3, 3, 2],
    ["use_of_funds", "Use of funds", "reviewed", 3, 3, 2],
    ["financial_readiness", "Financial readiness", "in_progress", 2, 3, 1],
    ["legal_readiness", "Legal & business readiness", "in_progress", 1, 3, 1],
  ].map(
    ([
      dimension,
      label,
      state,
      completedFields,
      requiredFields,
      evidenceCount,
    ]) => ({
      dimension: dimension as VentureProfile["readiness"][number]["dimension"],
      label: label as string,
      state: state as VentureProfile["readiness"][number]["state"],
      completedFields: completedFields as number,
      requiredFields: requiredFields as number,
      evidenceCount: evidenceCount as number,
    }),
  ),
};

export const demoThesis: InvestorThesis = {
  id: "1ab5c5f8-b646-4239-8a04-00a5264d86fe",
  sectors: ["Climate technology", "Agriculture"],
  stages: ["Prototype", "Early revenue"],
  regions: ["CALABARZON", "NCR"],
  ticketMin: 1000000,
  ticketMax: 5000000,
  minimumTraction: 2,
  impactGoals: ["SDG 8", "SDG 9"],
  riskTolerance: 3,
  excludedSectors: ["Gambling"],
  mentorshipOnly: false,
};

export const demoWorkspace: WorkspaceOverview = {
  profileName: "Maya Santos",
  roles: ["founder", "investor_mentor", "institution_reviewer"],
  venture: demoVenture,
  matches: [
    {
      id: "demo-match",
      venture: demoVenture,
      result: calculateMatch(demoVenture, demoThesis),
      revealed: false,
    },
  ],
  cohort: {
    name: "CALABARZON Venture Lab 2026",
    founders: 18,
    reviewers: 6,
    completion: 64,
    introductions: 3,
  },
};
