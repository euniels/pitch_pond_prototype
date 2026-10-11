export type Locale = "en" | "fil";

export type ReadinessCheck = {
  key: string;
  label: string;
  complete: boolean;
};

export type RewardTier = {
  id: number;
  title: string;
  description: string;
  amountMinor: number;
  quantityTotal: number | null;
  quantityClaimed: number;
  shippingFeeMinor: number;
  requiresShipping: boolean;
  shipsNationwide: boolean;
  estimatedDeliveryAt: string | null;
};

export type Campaign = {
  id: number;
  slug: string;
  title: string;
  tagline: string;
  type: "donation" | "reward";
  status: string;
  category: string;
  region: string;
  city: string | null;
  story: string;
  useOfFunds: string;
  risks: string;
  coverImageUrl: string | null;
  fundingGoalMinor: number;
  raisedMinor: number;
  minimumPledgeMinor: number;
  backerCount: number;
  fundedPercent: number;
  durationDays: number;
  startsAt: string | null;
  endsAt: string | null;
  daysLeft: number | null;
  isFeatured: boolean;
  readinessChecks: ReadinessCheck[];
  organization: {
    displayName: string;
    verificationStatus: string;
    region: string;
  };
  rewards?: RewardTier[];
  updates?: Array<{ id: number; title: string; body: string; publishedAt: string | null }>;
};

export type User = {
  id: number;
  name: string;
  email: string;
  role: "founder" | "backer" | "admin" | "reviewer";
  locale: Locale;
  emailVerified: boolean;
  phoneVerified: boolean;
  mfaEnabled: boolean;
};

export type Paginated<T> = {
  data: T[];
  links?: Record<string, unknown>;
  meta?: { current_page: number; last_page: number; total: number };
};
