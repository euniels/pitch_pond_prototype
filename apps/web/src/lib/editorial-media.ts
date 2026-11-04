export type EditorialMedia = {
  src: string;
  alt: string;
  position: string;
  tone: "aqua" | "lime" | "amber" | "mist";
  aspect: "wide" | "landscape" | "portrait";
};

export const editorialMedia = {
  hero: {
    src: "/images/editorial/hero-founders.webp",
    alt: "Three fictional Filipino startup founders reviewing a sustainable product prototype and evidence together in a workshop.",
    position: "center",
    tone: "aqua",
    aspect: "wide",
  },
  climate: {
    src: "/images/editorial/climate-microgrid.webp",
    alt: "A fictional Filipina climate-technology founder and technician inspecting a community solar microgrid.",
    position: "center",
    tone: "amber",
    aspect: "landscape",
  },
  agriculture: {
    src: "/images/editorial/agritech-greenhouse.webp",
    alt: "A fictional Filipino agricultural-technology founder and cooperative farmer inspecting a greenhouse sensor.",
    position: "center",
    tone: "lime",
    aspect: "landscape",
  },
  circular: {
    src: "/images/editorial/circular-materials.webp",
    alt: "A fictional Filipina circular-materials founder examining a construction panel made from recovered packaging.",
    position: "center",
    tone: "amber",
    aspect: "landscape",
  },
  health: {
    src: "/images/editorial/health-logistics.webp",
    alt: "A fictional rural-health logistics team preparing temperature-safe diagnostic carriers for provincial clinics.",
    position: "center",
    tone: "aqua",
    aspect: "landscape",
  },
  education: {
    src: "/images/editorial/education-technology.webp",
    alt: "A fictional Filipina education-technology founder testing an offline learning device with a public-school teacher.",
    position: "center",
    tone: "mist",
    aspect: "landscape",
  },
  enterprise: {
    src: "/images/editorial/enterprise-operations.webp",
    alt: "A fictional Philippine enterprise-software team reviewing a manufacturing workflow with an operations manager.",
    position: "center",
    tone: "aqua",
    aspect: "landscape",
  },
  founder: {
    src: "/images/editorial/founder-evidence-work.webp",
    alt: "A fictional Filipina founder organizing product samples, assumptions, and evidence at her worktable.",
    position: "center",
    tone: "amber",
    aspect: "landscape",
  },
  evidence: {
    src: "/images/editorial/mentor-evidence-review.webp",
    alt: "A fictional Filipino founder and mentor reviewing dated venture evidence and operating assumptions.",
    position: "center",
    tone: "mist",
    aspect: "landscape",
  },
  investor: {
    src: "/images/editorial/investor-review.webp",
    alt: "A fictional Filipino investor and sector mentor reviewing an anonymized venture profile together.",
    position: "center",
    tone: "aqua",
    aspect: "landscape",
  },
  institution: {
    src: "/images/editorial/institution-cohort.webp",
    alt: "A fictional Philippine incubator cohort reviewing evidence-backed venture progress around a worktable.",
    position: "center",
    tone: "lime",
    aspect: "landscape",
  },
  network: {
    src: "/images/editorial/pond-network.webp",
    alt: "Abstract dark pond ripples connected by subtle aqua and green light paths.",
    position: "center",
    tone: "aqua",
    aspect: "wide",
  },
} as const satisfies Record<string, EditorialMedia>;

export const ventureMediaById: Record<string, EditorialMedia> = {
  "amihan-cold-chain": editorialMedia.climate,
  "luntian-loop": editorialMedia.circular,
  "lakbay-health": editorialMedia.health,
  "aralbay-skills": editorialMedia.education,
  tanimsense: editorialMedia.agriculture,
  habiworks: editorialMedia.enterprise,
  "dagat-data": editorialMedia.climate,
  "likha-ledger": editorialMedia.enterprise,
};
