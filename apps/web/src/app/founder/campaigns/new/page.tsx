import type { Metadata } from "next";
import { CampaignWizard } from "@/components/campaign-wizard";
export const metadata: Metadata = { title: "Create a campaign" };
export default function NewCampaignPage() { return <CampaignWizard />; }
