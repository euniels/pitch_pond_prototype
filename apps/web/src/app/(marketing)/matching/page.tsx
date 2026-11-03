import {
  Eye,
  Handshake,
  ListChecks,
  Scale,
  SearchCheck,
  SlidersHorizontal,
} from "lucide-react";
import { ContentPage } from "@/components/content-page";
import { contentPages } from "@/lib/content";

export const metadata = { title: "Explainable matching" };
const icons = [
  SlidersHorizontal,
  Scale,
  ListChecks,
  Eye,
  SearchCheck,
  Handshake,
];
export default function Page() {
  const copy = contentPages.matching;
  return (
    <ContentPage
      {...copy}
      items={copy.items.map((item, index) => ({
        ...item,
        icon: icons[index]!,
      }))}
    />
  );
}
