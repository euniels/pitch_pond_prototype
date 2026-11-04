import {
  BarChart3,
  ClipboardCheck,
  FileQuestion,
  Milestone,
  PenLine,
  Sparkles,
} from "lucide-react";
import { ContentPage } from "@/components/content-page";
import { contentPages } from "@/lib/content";
import { editorialMedia } from "@/lib/editorial-media";

export const metadata = { title: "Founder Studio" };
const icons = [
  ClipboardCheck,
  FileQuestion,
  PenLine,
  Milestone,
  Sparkles,
  BarChart3,
];
export default function Page() {
  const copy = contentPages.founderStudio;
  return (
    <ContentPage
      {...copy}
      media={editorialMedia.founder}
      chapterLabel="From venture story to reviewable work"
      items={copy.items.map((item, index) => ({
        ...item,
        icon: icons[index]!,
      }))}
    />
  );
}
