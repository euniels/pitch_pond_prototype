import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCampaign } from "@/lib/api";
import { CampaignDetailView } from "@/components/campaign-detail-view";
import type { Campaign } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  try {
    const { data } = await getCampaign(slug);
    return { title: data.title, description: data.tagline, openGraph: { images: data.coverImageUrl ? [data.coverImageUrl] : [] } };
  } catch { return { title: "Campaign" }; }
}

export default async function CampaignPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let campaign: Campaign;
  try {
    campaign = (await getCampaign(slug)).data;
  } catch { notFound(); }
  return <CampaignDetailView campaign={campaign} />;
}
