import {
  BadgeCheck,
  FileSearch,
  Handshake,
  Network,
  Route,
  SlidersHorizontal,
} from "lucide-react";
import { ContentPage } from "@/components/content-page";
import { FaqSection } from "@/components/faq-section";
import { contentPages } from "@/lib/content";

export const metadata = { title: "How it works" };
const icons = [
  Route,
  FileSearch,
  Network,
  SlidersHorizontal,
  BadgeCheck,
  Handshake,
];
export default function Page() {
  const copy = contentPages.howItWorks;
  return (
    <ContentPage
      {...copy}
      items={copy.items.map((item, index) => ({
        ...item,
        icon: icons[index]!,
      }))}
    >
      <FaqSection />
    </ContentPage>
  );
}
