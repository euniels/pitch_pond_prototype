import {
  AlertTriangle,
  BadgeCheck,
  Database,
  Eye,
  Scale,
  Sparkles,
} from "lucide-react";
import { ContentPage } from "@/components/content-page";
import { contentPages } from "@/lib/content";
import { editorialMedia } from "@/lib/editorial-media";

export const metadata = { title: "Responsible AI" };
const icons = [Sparkles, Eye, Database, Scale, BadgeCheck, AlertTriangle];
export default function Page() {
  const copy = contentPages.responsibleAi;
  return (
    <ContentPage
      {...copy}
      media={editorialMedia.enterprise}
      chapterLabel="Constrained assistance with visible limits"
      items={copy.items.map((item, index) => ({
        ...item,
        icon: icons[index]!,
      }))}
    />
  );
}
