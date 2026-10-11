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

export const metadata = { title: "Responsible AI" };
const icons = [Sparkles, Eye, Database, Scale, BadgeCheck, AlertTriangle];
export default function Page() {
  const copy = contentPages.responsibleAi;
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
