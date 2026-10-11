import type { Metadata, Viewport } from "next";
import { Manrope, Newsreader } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/components/app-providers";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

const manrope = Manrope({ variable: "--font-sans", subsets: ["latin"] });
const newsreader = Newsreader({ variable: "--font-display", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: { default: "PitchPond — Back Filipino ideas with clarity", template: "%s · PitchPond" },
  description: "Donation and reward crowdfunding for verified Filipino founders and communities.",
  openGraph: { title: "PitchPond", description: "Back Filipino ideas with clarity.", type: "website" },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#f6f5ef" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${manrope.variable} ${newsreader.variable}`}>
      <body>
        <AppProviders>
          <a className="skip-link" href="#main-content">Skip to content</a>
          <SiteHeader />
          <main id="main-content">{children}</main>
          <SiteFooter />
        </AppProviders>
      </body>
    </html>
  );
}
