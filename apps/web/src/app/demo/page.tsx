import Link from "next/link";
import { ArrowRight, Info } from "lucide-react";
import { ProductTour } from "@/components/product-tour";
export const metadata = {
  title: "Product tour",
  robots: { index: false, follow: false },
};
export default function Page() {
  return (
    <main>
      <section className="page-hero compact ocean-hero">
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
