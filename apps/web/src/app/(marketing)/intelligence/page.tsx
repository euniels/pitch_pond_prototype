import Link from "next/link";
import { ArrowRight, BadgeCheck, BrainCircuit, LineChart, ShieldCheck } from "lucide-react";
import { FuturePathways } from "@/components/future-pathways";
import { VentureProjectionLab } from "@/components/venture-projection-lab";
import { editorialMedia } from "@/lib/editorial-media";

export const metadata = {
  title: "Venture intelligence",
  description:
    "Evidence-backed goal attainment likelihoods, transparent forecast ranges, and responsible AI explanations from PitchPond.",
};

export default function Page() {
  return (
    <main>
      <section className="page-hero intelligence-hero ocean-hero">
        <Image className="intelligence-hero-image" src={editorialMedia.network.src} alt="" fill priority sizes="100vw" aria-hidden="true" />
        <div className="hero-rays" />
        <div className="shell intelligence-hero-grid">
          <div>
            <span className="eyebrow light"><BrainCircuit />Venture intelligence</span>
            <h1>See the trajectory.<br /><em>Keep judgment human.</em></h1>
            <p>PitchPond combines evidence-backed readiness, explainable matching, deterministic goal forecasts, and consented AI explanations so founders can track measurable progress and supporters can ask better questions.</p>
            <div className="hero-actions"><Link className="button button-lime button-large" href="#projection-lab">Try the projection lab <ArrowRight /></Link><Link className="button button-glass button-large" href="/responsible-ai">Responsible AI</Link></div>
          </div>
          <div className="intelligence-principles">
            <div><LineChart /><span>Estimates declared goals</span><strong>6 months · 1 year · up to 3 years</strong></div>
            <div><BadgeCheck /><span>Explains every percentage</span><strong>P10/P50/P90 · confidence · sensitivity</strong></div>
            <div><ShieldCheck /><span>Never produces</span><strong>Company-success claims · investment verdicts</strong></div>
          </div>
        </div>
      </section>

      <section className="section shell intelligence-section" id="projection-lab">
        <VentureProjectionLab />
      </section>

      <section className="section future-pathways-section">
        <div className="shell"><FuturePathways /></div>
      </section>

      <section className="intelligence-cta">
        <div className="shell"><span className="eyebrow light">Measure before judgment</span><h2>Make every forecast reviewable, permissioned, and useful.</h2><p>Goal likelihood is distinct from company survival, fundraising success, and investment return. The pilot validates data quality, decision usefulness, and safeguards before external reliance.</p><Link className="button button-lime button-large" href="/pilot">Apply for the pilot <ArrowRight /></Link></div>
      </section>
    </main>
  );
}
import Image from "next/image";
