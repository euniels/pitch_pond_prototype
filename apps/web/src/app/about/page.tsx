import type { Metadata } from "next";
import { AboutContent } from "@/components/about-content";
export const metadata: Metadata = { title: "How PitchPond works" };
export default function AboutPage() { return <AboutContent />; }
