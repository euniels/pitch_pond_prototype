import {
  FileCheck2,
  FileKey2,
  Fingerprint,
  History,
  Link2,
  ShieldCheck,
} from "lucide-react";
import { ContentPage } from "@/components/content-page";
import { contentPages } from "@/lib/content";

export const metadata = { title: "Evidence Vault" };
const icons = [FileKey2, ShieldCheck, Link2, Fingerprint, History, FileCheck2];
export default function Page() {
  const copy = contentPages.evidenceVault;
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
