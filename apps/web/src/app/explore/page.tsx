import type { Metadata } from "next";
import { getCampaigns } from "@/lib/api";
import type { Campaign } from "@/lib/types";
import { ExploreClient } from "@/components/explore-client";

export const metadata: Metadata = { title: "Explore campaigns", description: "Discover verified donation and reward campaigns across the Philippines." };
export const dynamic = "force-dynamic";

export default async function ExplorePage() {
  let campaigns: Campaign[] = [];
  try { campaigns = (await getCampaigns("?perPage=24")).data; } catch { /* rendered as an actionable empty state */ }
  return <ExploreClient initialCampaigns={campaigns} />;
}
