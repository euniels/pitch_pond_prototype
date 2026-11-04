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
import { editorialMedia } from "@/lib/editorial-media";

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
      media={editorialMedia.investor}
      chapterLabel="From thesis to explainable fit"
      items={copy.items.map((item, index) => ({
        ...item,
        icon: icons[index]!,
      }))}
    />
  );
}
