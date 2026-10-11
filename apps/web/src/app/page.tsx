import { getCampaigns } from "@/lib/api";
import type { Campaign } from "@/lib/types";
import { HomeContent } from "@/components/home-content";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let campaigns: Campaign[] = [];
  let apiAvailable = true;
  try {
    campaigns = (await getCampaigns("?featured=1&perPage=3")).data;
  } catch {
    apiAvailable = false;
  }
  return <HomeContent campaigns={campaigns} apiAvailable={apiAvailable} />;
}
