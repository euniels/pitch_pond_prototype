import {
  BarChart3,
  Building2,
  ClipboardList,
  Handshake,
  ShieldCheck,
  Users,
} from "lucide-react";
import { ContentPage } from "@/components/content-page";
import { contentPages } from "@/lib/content";

export const metadata = { title: "Institutional pilots" };
const icons = [
  Building2,
  Users,
  ClipboardList,
  BarChart3,
  Handshake,
  ShieldCheck,
];
export default function Page() {
  const copy = contentPages.institutions;
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
