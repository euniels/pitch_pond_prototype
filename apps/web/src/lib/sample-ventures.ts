export type SampleVenture = {
  id: string;
  name: string;
  monogram: string;
  tagline: string;
  sector: string;
  stage: string;
  region: string;
  city: string;
  readiness: number;
  evidenceCount: number;
  matchScore: number;
  traction: string;
  fundingNeed: string;
  impactGoals: readonly string[];
  topGap: string;
  tone: "aqua" | "lime" | "blue" | "violet" | "amber" | "coral";
  milestones: readonly { label: string; status: "verified" | "active" | "planned" }[];
  matchReasons: readonly string[];
};

export const sampleVentures: readonly SampleVenture[] = [
  {
    id: "amihan-cold-chain",
    name: "Amihan Cold Chain",
    monogram: "AC",
    tagline: "Solar-powered cold storage for small farming cooperatives.",
    sector: "Climate technology",
    stage: "Early revenue",
    region: "CALABARZON",
    city: "Calamba, Laguna",
    readiness: 85,
    evidenceCount: 22,
    matchScore: 88,
    traction: "3 cooperative pilots · 2 paid renewals",
    fundingNeed: "₱1.5M–₱3M",
    impactGoals: ["SDG 8", "SDG 9"],
    topGap: "Document equipment ownership and twelve-month cash assumptions.",
    tone: "aqua",
    milestones: [
      { label: "First paid cooperative deployment", status: "verified" },
      { label: "Solar efficiency field report", status: "active" },
      { label: "Batangas expansion", status: "planned" },
    ],
    matchReasons: ["Sector fit", "Ticket overlap", "CALABARZON focus"],
  },
  {
    id: "luntian-loop",
    name: "Luntian Loop Materials",
    monogram: "LL",
    tagline: "Converts sachet waste into durable construction panels.",
    sector: "Circular economy",
    stage: "Pilot",
    region: "CALABARZON",
    city: "Antipolo, Rizal",
    readiness: 74,
    evidenceCount: 17,
    matchScore: 81,
    traction: "2 LGU collection partners · lab validation complete",
    fundingNeed: "₱2M–₱4M",
    impactGoals: ["SDG 9", "SDG 11", "SDG 12"],
    topGap: "Add repeatable unit-economics evidence from the pilot line.",
    tone: "lime",
    milestones: [
      { label: "Material strength validation", status: "verified" },
      { label: "LGU collection agreement", status: "verified" },
      { label: "Pilot production run", status: "active" },
    ],
    matchReasons: ["Impact alignment", "Stage fit", "Geography fit"],
  },
  {
    id: "lakbay-health",
    name: "Lakbay Health Logistics",
    monogram: "LH",
    tagline: "Route coordination for rural clinics and diagnostic samples.",
    sector: "Health",
    stage: "Prototype",
    region: "CALABARZON",
    city: "Batangas City",
    readiness: 67,
    evidenceCount: 13,
    matchScore: 76,
    traction: "5 clinic interviews · supervised route simulation",
    fundingNeed: "₱800K–₱1.8M",
    impactGoals: ["SDG 3", "SDG 10"],
    topGap: "Complete health-data governance and operating-risk review.",
    tone: "blue",
    milestones: [
      { label: "Clinic workflow research", status: "verified" },
      { label: "Route simulation", status: "active" },
      { label: "Supervised live pilot", status: "planned" },
    ],
    matchReasons: ["Problem evidence", "Impact fit", "Mentor expertise"],
  },
  {
    id: "aralbay-skills",
    name: "AralBay Skills",
    monogram: "AS",
    tagline: "Employer-linked micro-courses for provincial service workers.",
    sector: "Education",
    stage: "Early revenue",
    region: "CALABARZON",
    city: "Lucena, Quezon",
    readiness: 79,
    evidenceCount: 19,
    matchScore: 84,
    traction: "146 learners · 4 employer partners · 61% completion",
    fundingNeed: "₱1M–₱2.5M",
    impactGoals: ["SDG 4", "SDG 8", "SDG 10"],
    topGap: "Separate cohort acquisition cost from sponsored enrollment.",
    tone: "violet",
    milestones: [
      { label: "First employer cohort", status: "verified" },
      { label: "Outcome survey", status: "active" },
      { label: "Credential partnership", status: "planned" },
    ],
    matchReasons: ["Revenue signal", "Stage fit", "Inclusive growth"],
  },
  {
    id: "tanimsense",
    name: "TanimSense",
    monogram: "TS",
    tagline: "Low-bandwidth crop monitoring for high-value vegetable farms.",
    sector: "Agriculture",
    stage: "Pilot",
    region: "CALABARZON",
    city: "Los Baños, Laguna",
    readiness: 72,
    evidenceCount: 15,
    matchScore: 79,
    traction: "8 test plots · 18% water-use reduction signal",
    fundingNeed: "₱1.2M–₱2M",
    impactGoals: ["SDG 2", "SDG 9", "SDG 13"],
    topGap: "Validate sensor durability across a full growing season.",
    tone: "amber",
    milestones: [
      { label: "Eight-plot prototype test", status: "verified" },
      { label: "Farmer usability study", status: "active" },
      { label: "Full-season validation", status: "planned" },
    ],
    matchReasons: ["Agriculture thesis", "Ticket overlap", "Climate impact"],
  },
  {
    id: "habiworks",
    name: "HabiWorks Collective",
    monogram: "HC",
    tagline: "Order and production tools for women-led artisan groups.",
    sector: "Enterprise software",
    stage: "Prototype",
    region: "Central Luzon",
    city: "San Fernando, Pampanga",
    readiness: 61,
    evidenceCount: 10,
    matchScore: 69,
    traction: "24 artisan interviews · 3 workflow trials",
    fundingNeed: "₱600K–₱1.2M",
    impactGoals: ["SDG 5", "SDG 8", "SDG 10"],
    topGap: "Clarify the buyer segment and document willingness to pay.",
    tone: "coral",
    milestones: [
      { label: "Discovery interviews", status: "verified" },
      { label: "Group workflow trial", status: "active" },
      { label: "Paid design partner", status: "planned" },
    ],
    matchReasons: ["Mentorship fit", "Impact alignment", "Risk tolerance"],
  },
] as const;
