import type { Metadata, Viewport } from "next";
import { Manrope, Sora } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";
import "./visual-system.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

const bodyFont = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});
const displayFont = Sora({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://pitchpondprototype.vercel.app",
  ),
  title: {
    default: "PitchPond — Fundability before fundraising",
    template: "%s · PitchPond",
  },
  description:
    "An evidence-first venture-readiness and explainable matching platform for Filipino founders, mentors, investors, and startup programs.",
  applicationName: "PitchPond",
  keywords: [
    "venture readiness",
    "Filipino startups",
    "CALABARZON",
    "investor matching",
    "evidence vault",
  ],
  openGraph: {
    title: "PitchPond — Fundability before fundraising",
    description:
      "Turn promising ventures into evidence-backed, investor-ready profiles.",
    type: "website",
    locale: "en_PH",
  },
  robots: { index: true, follow: true },
};

export const dynamic = "force-dynamic";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#061525",
  colorScheme: "light dark",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  const themeScript = `try{const stored=localStorage.getItem("pitchpond-theme");const theme=stored==="dark"||stored==="light"?stored:(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");document.documentElement.dataset.theme=theme;document.documentElement.style.colorScheme=theme}catch{document.documentElement.dataset.theme="light"}`;
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <script nonce={nonce} dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${bodyFont.variable} ${displayFont.variable}`}>
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        <SiteHeader />
        <div id="main-content">{children}</div>
        <SiteFooter />
      </body>
    </html>
  );
}
