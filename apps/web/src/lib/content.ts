import { editorialMedia } from "@/lib/editorial-media";

export const navItems = [
  { href: "/how-it-works", label: "How it works" },
  { href: "/founder-studio", label: "For founders" },
  { href: "/matching", label: "For supporters" },
  { href: "/intelligence", label: "Intelligence" },
  { href: "/institutions", label: "For institutions" },
  { href: "/pricing", label: "Pricing" },
];

export const headerNavigation = [
  {
    label: "Platform",
    links: [
      {
        href: "/how-it-works",
        label: "How it works",
        description: "From venture evidence to qualified introductions.",
      },
      {
        href: "/evidence-vault",
        label: "Evidence Vault",
        description: "Private, permissioned proof behind every claim.",
      },
      {
        href: "/demo",
        label: "Product tour",
        description: "Explore the platform through fictional venture data.",
      },
    ],
  },
  {
    label: "Solutions",
    links: [
      {
        href: "/founder-studio",
        label: "For founders",
        description: "Build readiness, evidence, and measurable goals.",
      },
      {
        href: "/matching",
        label: "For investors & mentors",
        description: "Review explainable fit without pay-to-rank influence.",
      },
      {
        href: "/institutions",
        label: "For institutions",
        description: "Coordinate cohorts, reviewers, and pilot outcomes.",
      },
    ],
  },
  { href: "/intelligence", label: "Intelligence" },
  { href: "/pricing", label: "Pricing" },
] as const;

export const mobileNavItems = [
  { href: "/how-it-works", label: "How it works" },
  { href: "/evidence-vault", label: "Evidence Vault" },
  { href: "/demo", label: "Product tour" },
  { href: "/founder-studio", label: "For founders" },
  { href: "/matching", label: "For investors & mentors" },
  { href: "/institutions", label: "For institutions" },
  { href: "/intelligence", label: "Intelligence" },
  { href: "/pricing", label: "Pricing" },
] as const;

export const footerGroups = [
  {
    title: "Platform",
    links: [
      ["How it works", "/how-it-works"],
      ["Founder Studio", "/founder-studio"],
      ["Evidence Vault", "/evidence-vault"],
      ["Explainable matching", "/matching"],
      ["Venture intelligence", "/intelligence"],
    ],
  },
  {
    title: "Pilot",
    links: [
      ["Institutions", "/institutions"],
      ["Pricing", "/pricing"],
      ["Apply", "/pilot"],
      ["Sign in", "/sign-in"],
    ],
  },
  {
    title: "Trust",
    links: [
      ["Responsible AI", "/responsible-ai"],
      ["Privacy", "/privacy"],
      ["Terms", "/terms"],
      ["Accessibility", "/accessibility"],
    ],
  },
] as const;

export const pilotTargets = [
  { value: "15–20", label: "founders in the concierge pilot" },
  { value: "3–5", label: "qualified introductions to validate" },
  { value: "1", label: "institutional pilot partner" },
  { value: "0", label: "paid influence on readiness or matching" },
];

export const featuredVentures = [
  {
    slug: "amihan-cold-chain",
    name: "Amihan Cold Chain",
    summary: "Solar-powered cold storage for small farming cooperatives.",
    sector: "Climate technology",
    stage: "Early revenue",
    location: "Calamba, Laguna",
    readiness: 85,
    evidence: 22,
    image: editorialMedia.climate,
  },
  {
    slug: "luntian-loop-materials",
    name: "Luntian Loop Materials",
    summary: "Turns recovered flexible packaging into durable building panels.",
    sector: "Circular economy",
    stage: "Pilot",
    location: "Antipolo, Rizal",
    readiness: 74,
    evidence: 17,
    image: editorialMedia.circular,
  },
  {
    slug: "lakbay-health-logistics",
    name: "Lakbay Health Logistics",
    summary:
      "Coordinates temperature-safe diagnostic routes for rural clinics.",
    sector: "Health logistics",
    stage: "Prototype",
    location: "Batangas City",
    readiness: 67,
    evidence: 13,
    image: editorialMedia.health,
  },
  {
    slug: "tanimsense",
    name: "TanimSense",
    summary: "Low-bandwidth crop monitoring for high-value vegetable farms.",
    sector: "Agriculture",
    stage: "Pilot",
    location: "Los Baños, Laguna",
    readiness: 72,
    evidence: 15,
    image: editorialMedia.agriculture,
  },
  {
    slug: "aralbay-skills",
    name: "AralBay Skills",
    summary: "Employer-linked micro-courses for provincial service workers.",
    sector: "Education",
    stage: "Early revenue",
    location: "Lucena, Quezon",
    readiness: 79,
    evidence: 19,
    image: editorialMedia.education,
  },
  {
    slug: "habiworks",
    name: "HabiWorks Collective",
    summary: "Order and production tools for women-led artisan groups.",
    sector: "Enterprise software",
    stage: "Prototype",
    location: "San Fernando, Pampanga",
    readiness: 61,
    evidence: 10,
    image: editorialMedia.enterprise,
  },
] as const;

export const readinessDimensions = [
  ["Problem", "Define the customer pain and who experiences it."],
  ["Market", "Support market assumptions with dated evidence."],
  ["Solution", "Show what exists, how it works, and what remains."],
  ["Traction", "Record demand, pilots, revenue, or learning signals."],
  ["Team", "Clarify accountable roles and capability gaps."],
  ["Business model", "Explain who pays, why, and the key economics."],
  ["Use of funds", "Connect capital needs to specific milestones."],
  ["Financial", "Make assumptions and runway visible."],
  ["Legal", "Track registrations, ownership, contracts, and risks."],
] as const;

export const homeCopy = {
  hero: {
    eyebrow: "CALABARZON pilot · Applications open",
    title: "Become fundable.",
    titleAccent: "Find the right match.",
    intro:
      "PitchPond helps early-stage Filipino founders turn venture claims into evidence, close readiness gaps, and meet investors, mentors, and programs whose explicit criteria actually fit.",
    primaryCta: "Join the pilot",
    secondaryCta: "Explore the product",
    principles: [
      "Private by default",
      "Explainable matching",
      "Human-led decisions",
    ],
  },
  pilotStrip: {
    eyebrow: "Measured pilot—not vanity metrics",
    body: "These are validation targets, not accomplished traction.",
  },
  workflow: {
    eyebrow: "One connected workflow",
    title: "Readiness you can inspect. Matching you can explain.",
    intro:
      "PitchPond replaces scattered decks, generic directories, and opaque rankings with a traceable path from a venture claim to qualified human conversation.",
    items: [
      [
        "route",
        "01",
        "Map readiness",
        "See what is complete, what is missing, and which dimensions need evidence.",
      ],
      [
        "evidence",
        "02",
        "Connect evidence",
        "Link dated proof to specific claims in a permission-based Evidence Vault.",
      ],
      [
        "network",
        "03",
        "Build the graph",
        "Understand how claims, milestones, gaps, and supporter criteria connect.",
      ],
      [
        "ai",
        "04",
        "Explain the fit",
        "Use explicit criteria and guarded AI language—not a black-box verdict.",
      ],
      [
        "people",
        "05",
        "Make introductions",
        "Request a qualified conversation and track diligence without executing transactions.",
      ],
    ],
  },
  tour: {
    eyebrow: "Interactive product tour",
    title: "One platform, three clear perspectives.",
    intro:
      "Explore synthetic pilot data to see how the same evidence supports founders, reviewers, and ecosystem programs.",
  },
  readiness: {
    eyebrow: "Readiness Map",
    title: "Know what is missing before asking for capital.",
    intro:
      "The map records objective completion and evidence coverage across nine practical dimensions. It does not forecast fundraising outcomes.",
    cta: "Explore Founder Studio",
  },
  ecosystem: {
    eyebrow: "B2B2C from day one",
    title: "Built for cohorts, not another empty marketplace.",
    body: "Universities, TBIs, incubators, accelerators, and entrepreneurship programs can bring a trusted cohort, assign reviewers, monitor readiness, and measure what happens after a match.",
    cta: "See institutional workflows",
    cardTitle: "A measurable pilot",
    measures: [
      "Profile and evidence completion",
      "Reviewer screening time",
      "Match acceptance",
      "Introduction-to-meeting conversion",
      "Founder and supporter repeat usage",
    ],
  },
  finalCta: {
    eyebrow: "From potential to possible",
    title: "Build the proof behind the pitch.",
    body: "Join the controlled CALABARZON pilot as a founder, investor, mentor, or institution.",
    primary: "Apply for the pilot",
    secondary: "How PitchPond works",
  },
} as const;

export const pricingCopy = {
  hero: {
    eyebrow: "Indicative pilot pricing",
    title: "Pay for workflow—not a better score.",
    body: "Pilot plans support storage, analytics, collaboration, and hands-on readiness work. Payment never changes readiness or compatibility.",
  },
  plans: [
    {
      name: "Free Founder",
      price: "₱0",
      unit: "during the pilot",
      desc: "Start a structured venture profile and basic readiness diagnostic.",
      features: [
        "Nine-dimension readiness map",
        "Standard venture profile",
        "Core claim-to-evidence links",
        "Pilot community access",
      ],
      cta: "Apply as a founder",
      featured: false,
    },
    {
      name: "Founder Pro",
      price: "₱499–₱999",
      unit: "indicative monthly range",
      desc: "Expanded workflow for founders actively preparing for review.",
      features: [
        "Expanded Evidence Vault capacity",
        "Advanced readiness analytics",
        "Collaborator access",
        "Progress history and exports",
      ],
      cta: "Register interest",
      featured: true,
    },
    {
      name: "Institutional Pilot",
      price: "₱25k–₱75k",
      unit: "indicative per cohort",
      desc: "A managed cohort-to-supporter workflow for ecosystem programs.",
      features: [
        "Cohort and reviewer workspace",
        "Founder progress visibility",
        "Curated introduction workflow",
        "Pilot measurement and support",
      ],
      cta: "Discuss a pilot",
      featured: false,
    },
  ],
  services: [
    {
      title: "Pitch Readiness Sprint",
      body: "A separately scoped service for evidence preparation, financial and pitch review, and rehearsal. It is not investment advice.",
    },
    {
      title: "Investor Workbench",
      body: "Free for invited pilot investors and mentors. Later professional tiers may add team workflow and analytics.",
    },
  ],
  trust:
    "Prices are validation ranges, not active subscriptions. Pilot access is assigned manually and no checkout or billing details are collected.",
  excludedTitle: "Not included in this release",
  excludedBody:
    "Transaction fees, fund custody, securities execution, sponsored match placement, or payment-linked rankings.",
} as const;

export const pilotCopy = {
  hero: {
    eyebrow: "Controlled CALABARZON pilot",
    title: "Help prove the workflow with real behavior.",
    body: "We are looking for founders, investors, mentors, and ecosystem institutions who want to test readiness, evidence, screening, and introductions—not another popularity feed.",
  },
  eyebrow: "Who the pilot is for",
  title: "A small cohort with enough diversity to learn.",
  audiences: [
    {
      icon: "founders",
      title: "Founders",
      body: "Student founders, early-stage startups, and scalable MSMEs preparing for mentorship, programs, partnerships, or capital.",
    },
    {
      icon: "supporters",
      title: "Supporters",
      body: "Angel investors, mentors, venture scouts, and experienced business owners willing to review explicit criteria.",
    },
    {
      icon: "institutions",
      title: "Institutions",
      body: "Universities, TBIs, incubators, accelerators, chambers, and entrepreneurship programs managing a cohort.",
    },
    {
      icon: "location",
      title: "Launch focus",
      body: "CALABARZON is the beachhead. Other Philippine regions remain supported where a pilot relationship fits.",
    },
  ],
  privacy:
    "Applications are used only for pilot assessment and contact. Submission does not guarantee acceptance.",
} as const;

export const policyCopy = {
  privacy: {
    eyebrow: "Trust center",
    title: "Privacy notice",
    sections: [
      [
        "What PitchPond processes",
        "During the controlled pilot, PitchPond may process account details, organization and venture profiles, investor or mentor criteria, readiness responses, evidence files and metadata, permissions, review activity, introductions, support requests, and security or audit events.",
      ],
      [
        "Why it is used",
        "Information is used to provide venture-readiness workflow, permissioned evidence review, explainable matching, introductions, institutional cohort operations, security, support, and pilot measurement. PitchPond does not sell personal information or use payment to alter matching.",
      ],
      [
        "Private evidence",
        "Evidence is private by default. Access is limited by organization membership, cohort assignment, explicit grants, or a consented introduction. File links are time-limited. Evidence remains quarantined until security checks succeed.",
      ],
      [
        "AI assistance",
        "AI receives only the fields or clean evidence selected by an authorized user after consent. AI output is advisory. Application logs avoid raw evidence content; separate AI audit records keep operational metadata needed for accountability.",
      ],
      [
        "Retention and control",
        "Users can review consent history, revoke evidence grants, export account data, and request deletion. Operational and security records may be retained where necessary to investigate abuse, satisfy legal obligations, or preserve an accurate audit trail.",
      ],
      [
        "Service providers and safeguards",
        "The pilot uses contracted infrastructure, authentication, email, malware-scanning, and AI providers. Production credentials remain server-side. Sensitive access is logged, least-privilege controls are applied, and administrative roles require stronger authentication.",
      ],
      [
        "Contact and review status",
        "This notice is implementation-ready pilot copy, not a substitute for legal review. A Philippine privacy officer and counsel must approve the final controller identity, contact details, retention schedule, data-processing agreements, and data-subject request process before external onboarding.",
      ],
    ],
  },
  terms: {
    eyebrow: "Pilot terms",
    title: "Terms of pilot use",
    sections: [
      [
        "Purpose",
        "PitchPond is pilot-stage software for organizing venture readiness, supporting evidence, reviewer workflow, explicit supporter criteria, and qualified introductions.",
      ],
      [
        "Not a funding service",
        "PitchPond does not offer or sell securities, execute investments, hold or transfer funds, provide financial safeguards, guarantee introductions or funding, or provide legal, tax, accounting, or investment advice.",
      ],
      [
        "User responsibilities",
        "Users must provide information they are authorized to share, keep claims accurate, respect confidentiality and permissions, avoid malicious uploads, and independently verify information before relying on it.",
      ],
      [
        "Evidence and confidentiality",
        "Access to evidence is limited and revocable. Permission to view a file does not grant a right to republish, redistribute, or use it beyond the stated review purpose.",
      ],
      [
        "AI and matching limitations",
        "AI suggestions may be incomplete or incorrect and require human review. Compatibility reflects stated criteria under a published rubric; it is not a prediction, endorsement, diligence conclusion, or recommendation.",
      ],
      [
        "Pilot access",
        "Access is invitation-only and may be suspended to protect users, investigate abuse, maintain the pilot, or comply with law. Plans are assigned manually; indicative prices are not active subscription offers.",
      ],
      [
        "Review status",
        "These terms must be completed with the legal entity name, address, governing law, contact details, limitation provisions, complaint process, and counsel approval before external onboarding.",
      ],
    ],
  },
  accessibility: {
    eyebrow: "Accessibility",
    title: "A product people can use with clarity",
    sections: [
      [
        "Our target",
        "PitchPond targets WCAG 2.2 Level AA for public pages and authenticated pilot workflows.",
      ],
      [
        "Included practices",
        "Interfaces use semantic landmarks, ordered headings, keyboard-reachable controls, visible focus, descriptive labels, status announcements, sufficient contrast, reduced-motion support, responsive layouts, and alternatives to color-only meaning.",
      ],
      [
        "Documents and evidence",
        "Founders are asked to provide descriptive titles and accessible alternatives where practical. Reviewers can access extracted text for supported clean documents, but source-document accessibility remains the uploader’s responsibility.",
      ],
      [
        "Known pilot limitations",
        "The interactive Fundability Graph has a text and card-based readiness equivalent. Some uploaded third-party files may not be fully accessible. The team will log, prioritize, and report accessibility issues found during the pilot.",
      ],
      [
        "Feedback",
        "Before external onboarding, PitchPond will publish a monitored accessibility contact address and response target. Pilot participants can also report an issue through their institution or assigned support contact.",
      ],
    ],
  },
} as const;
// English is the complete pilot locale. Page components consume this dictionary
// so a future `fil` dictionary can be introduced without restructuring routes.
export const contentPages = {
  howItWorks: {
    eyebrow: "From profile to qualified conversation",
    title: "A transparent path to investor readiness.",
    intro:
      "PitchPond organizes the work founders already need to do and gives supporters a comparable, evidence-centered way to review it.",
    note: "PitchPond organizes readiness and introductions. Final readiness judgments, diligence decisions, and investment decisions remain human-led.",
    items: [
      {
        title: "Diagnose readiness",
        body: "Complete a guided diagnostic across nine venture dimensions.",
        points: [
          "Objective completion states",
          "Visible evidence coverage",
          "Versioned readiness rubric",
        ],
      },
      {
        title: "Link claims to proof",
        body: "Add dated evidence, control access, and show exactly what each item supports.",
        points: [
          "Private-by-default vault",
          "Claim-level traceability",
          "Revocable sharing",
        ],
      },
      {
        title: "See the Fundability Graph",
        body: "Explore relationships among claims, evidence, milestones, gaps, and fit criteria.",
      },
      {
        title: "Define supporter criteria",
        body: "Investors and mentors set sectors, stage, ticket, geography, traction, impact, and risk preferences.",
      },
      {
        title: "Understand every match",
        body: "Compatibility comes from a published rubric with fit factors and mismatches—not popularity or payment.",
      },
      {
        title: "Request an introduction",
        body: "Both sides can consent, share selected documents, and track diligence and outcomes.",
      },
    ],
  },
  founderStudio: {
    eyebrow: "For founders",
    title: "Build a venture profile that can stand up to questions.",
    intro:
      "Founder Studio turns a pitch narrative into structured, reviewable work—without pretending a score can predict success.",
    note: "Founder Pro adds workflow, analytics, storage, and collaboration. It never improves a readiness state or match ranking.",
    items: [
      {
        title: "Guided venture profile",
        body: "Work through problem, market, solution, traction, team, model, use of funds, financial, and legal readiness.",
      },
      {
        title: "Missing-evidence map",
        body: "See which important claims still lack dated support.",
      },
      {
        title: "Claim workspace",
        body: "Write specific claims and connect each one to proof, milestones, or known limitations.",
      },
      {
        title: "Milestone planning",
        body: "Tie a capital need to an accountable outcome, target date, and evidence.",
      },
      {
        title: "Guarded AI assistance",
        body: "Request editable summaries and gap suggestions based only on fields and evidence you select.",
      },
      {
        title: "Progress over time",
        body: "Track objective completion, evidence coverage, review outcomes, and introductions.",
      },
    ],
  },
  evidenceVault: {
    eyebrow: "Evidence Vault",
    title: "Make venture claims traceable—not louder.",
    intro:
      "Store supporting material privately, attach it to the exact claim it supports, and share it only when the context is right.",
    note: "Files remain private, quarantined until malware scanning succeeds, and unavailable to AI unless an authorized user explicitly selects them.",
    items: [
      {
        title: "Private by default",
        body: "Every file is protected by membership and row-level access rules.",
      },
      {
        title: "Quarantine and scan",
        body: "Type, size, content signature, ownership, and malware status are checked before use.",
      },
      {
        title: "Claim-level links",
        body: "Show whether an interview, contract, registration, prototype, or financial file supports a specific claim.",
      },
      {
        title: "Integrity metadata",
        body: "Record dates, checksums, owners, source pages, and processing state.",
      },
      {
        title: "Revocable access",
        body: "Grant access to a reviewer or introduction, add an expiry, and revoke it later.",
      },
      {
        title: "Controlled summaries",
        body: "Generate an editable summary only from clean, selected evidence and validate every cited evidence ID.",
      },
    ],
  },
  matching: {
    eyebrow: "For investors and mentors",
    title: "Know why a venture fits—and where it does not.",
    intro:
      "PitchPond compares a supporter's explicit thesis with consented venture data. The result is inspectable, reproducible, and independent of payment.",
    note: "Compatibility is not investment advice and does not predict company performance. It is a structured explanation of stated criteria.",
    items: [
      {
        title: "Investor Thesis Builder",
        body: "Set sector, stage, ticket, geography, traction, impact, exclusions, and risk tolerance.",
      },
      {
        title: "Versioned rubric",
        body: "Review a 100-point factor breakdown with fixed weights and hard exclusions.",
      },
      {
        title: "Reasons and mismatches",
        body: "See positive fit and unresolved gaps side by side.",
      },
      {
        title: "Blind First Look",
        body: "Hide names, logos, precise location, and prestige cues during the first screen.",
      },
      {
        title: "Permissioned diligence",
        body: "Request access to selected evidence instead of receiving a permanent data-room link.",
      },
      {
        title: "Qualified introductions",
        body: "Request a conversation, capture both parties' consent, and track next steps.",
      },
    ],
  },
  institutions: {
    eyebrow: "For universities, TBIs, and programs",
    title: "Turn a founder cohort into a measurable readiness workflow.",
    intro:
      "Give founders a shared structure, reviewers a fairer first screen, and program leaders outcome data that goes beyond attendance.",
    note: "Institution access is scoped to an invited cohort. Founder evidence is not automatically visible outside the permissions they grant.",
    items: [
      {
        title: "Cohort setup",
        body: "Create a program, invite founders and reviewers, and define dates and participation status.",
      },
      {
        title: "Reviewer assignments",
        body: "Assign ventures, support Blind First Look, and maintain private reviewer notes.",
      },
      {
        title: "Readiness visibility",
        body: "Monitor profile completion, evidence coverage, gaps, and review status.",
      },
      {
        title: "Pilot analytics",
        body: "Measure screening time, match acceptance, meeting conversion, and repeat usage.",
      },
      {
        title: "Curated introductions",
        body: "Coordinate consented conversations and capture follow-up outcomes.",
      },
      {
        title: "Auditable access",
        body: "Track invitations, role changes, identity reveals, grants, and administrative actions.",
      },
    ],
  },
  responsibleAi: {
    eyebrow: "Responsible AI",
    title: "AI assists the work. It does not make the decision.",
    intro:
      "PitchPond uses constrained AI for organization, gap suggestions, evidence summaries, and clear language around deterministic match factors.",
    note: "AI output can be incomplete or wrong. Goal-attainment percentages come from a deterministic, versioned forecast—not from the language model. AI may explain the fixed drivers and limitations but cannot change the result. Human reviewers remain accountable for support and investment decisions.",
    items: [
      {
        title: "Limited purposes",
        body: "AI is available only for defined advisory tasks with strict response schemas.",
      },
      {
        title: "Explicit selection",
        body: "Evidence content is sent only when an authorized user selects it and consents.",
      },
      {
        title: "Minimal logging",
        body: "Audit records retain purpose, model, prompt version, hashes, status, and evidence IDs—not raw document text.",
      },
      {
        title: "No pay-to-rank",
        body: "Plan level, payment, sponsorship, and prestige are excluded from readiness and matching.",
      },
      {
        title: "Human review",
        body: "Suggestions are editable, visibly labeled, and never automatically published.",
      },
      {
        title: "Safe failure",
        body: "Refusals, timeouts, invalid outputs, and outages fall back without changing authoritative results.",
      },
    ],
  },
} as const;

// End of the English-complete pilot content dictionary.
