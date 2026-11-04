import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Manrope, Sora } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";
import "./visual-system.css";
import "./redesign.css";
import "./cinematic.css";

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
const editorialFont = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-editorial",
  weight: ["400", "500", "600"],
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
    "An evidence-first venture-readiness, goal forecasting, and explainable matching platform for Filipino founders, mentors, investors, and startup programs.",
  applicationName: "PitchPond",
  keywords: [
    "venture readiness",
    "Filipino startups",
    "CALABARZON",
    "investor matching",
    "evidence vault",
    "startup projections",
    "goal attainment likelihood",
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
  themeColor: "#031a14",
  colorScheme: "light dark",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  const themeScript = `try{const stored=localStorage.getItem("pitchpond-theme");const routeDefault="dark";const theme=stored==="dark"||stored==="light"?stored:routeDefault;document.documentElement.dataset.theme=theme;document.documentElement.style.colorScheme=theme}catch{document.documentElement.dataset.theme="dark"}`;
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <script nonce={nonce} dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${bodyFont.variable} ${displayFont.variable} ${editorialFont.variable}`}>
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        <div id="main-content">{children}</div>
      </body>
    </html>
  );
}
