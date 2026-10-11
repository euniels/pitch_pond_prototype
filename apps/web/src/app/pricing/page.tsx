import type { Metadata } from "next";
import { PricingContent } from "@/components/pricing-content";

export const metadata: Metadata = { title: "Plans and fees" };
export default function PricingPage() { return <PricingContent />; }
