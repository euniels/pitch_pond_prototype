import Link from "next/link";
import { ArrowRight, Info } from "lucide-react";
import { ProductTour } from "@/components/product-tour";
import { SectionHeading } from "@/components/section-heading";
import { VentureSandbox } from "@/components/venture-sandbox";
import { editorialMedia } from "@/lib/editorial-media";
export const metadata = {
  title: "Product tour",
  robots: { index: false, follow: false },
};
export default function Page() {
  return (
    <main>
      <section className="page-hero compact ocean-hero demo-cinematic-hero">
        <Image src={editorialMedia.institution.src} alt={editorialMedia.institution.alt} fill priority sizes="100vw" />
        <div className="editorial-page-shade" aria-hidden="true" />
        <div className="hero-rays" />
        <div className="shell">
          <span className="eyebrow light">Synthetic product tour</span>
          <h1>See the evidence-first workflow.</h1>
          <p>
            This tour uses fictional data and does not represent a real venture,
            investor decision, customer, or pilot result.
          </p>
        </div>
      </section>
      <section className="section shell">
        <div className="demo-notice">
          <Info />
          <p>
            Explore each perspective below. Authenticated pilot workspaces are
            private and invitation-only.
          </p>
        </div>
        <ProductTour full />
        <div className="demo-sandbox-section" id="venture-sandbox">
          <SectionHeading
            eyebrow="Synthetic venture sandbox"
            title="Inspect a realistic, privacy-safe pilot pipeline."
            intro="Search and filter sample businesses, compare readiness and evidence coverage, then inspect the reasons behind each fictional compatibility result."
          />
          <VentureSandbox />
        </div>
        <div className="center-actions">
          <Link className="button button-primary button-large" href="/pilot">
            Apply for the pilot
            <ArrowRight />
          </Link>
        </div>
      </section>
    </main>
  );
}
import Image from "next/image";
