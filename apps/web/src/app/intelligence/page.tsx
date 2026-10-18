import Link from "next/link";
import { ArrowRight, BadgeCheck, BrainCircuit, LineChart, ShieldCheck } from "lucide-react";
import { FuturePathways } from "@/components/future-pathways";
import { VentureProjectionLab } from "@/components/venture-projection-lab";

export const metadata = {
  title: "Venture intelligence",
  description:
    "Transparent, assumption-based venture progress scenarios and responsible future entrepreneurship pathways from PitchPond.",
};

export default function Page() {
  return (
    <main>
      <section className="page-hero intelligence-hero ocean-hero">
        <div className="hero-rays" />
        <div className="shell intelligence-hero-grid">
          <div>
            <span className="eyebrow light"><BrainCircuit />Venture intelligence</span>
            <h1>See the trajectory.<br /><em>Keep judgment human.</em></h1>
            <p>PitchPond combines evidence-backed readiness, explainable matching, operating scenarios, and consented AI assistance so founders can track progress and supporters can ask better questions.</p>
            <div className="hero-actions"><Link className="button button-lime button-large" href="#projection-lab">Try the projection lab <ArrowRight /></Link><Link className="button button-glass button-large" href="/responsible-ai">Responsible AI</Link></div>
          </div>
          <div className="intelligence-principles">
            <div><LineChart /><span>Projects operating progress</span><strong>Readiness · evidence · milestones</strong></div>
            <div><BadgeCheck /><span>Explains every result</span><strong>Assumptions · factors · uncertainty</strong></div>
            <div><ShieldCheck /><span>Never produces</span><strong>Success odds · investment verdicts</strong></div>
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
        <div className="shell"><span className="eyebrow light">Pilot before prediction</span><h2>Test the decisions, assumptions, and safeguards with real users.</h2><p>The first pilot remains focused on venture readiness and qualified introductions. Future pathways move forward only after separate user, operational, privacy, and legal validation.</p><Link className="button button-lime button-large" href="/pilot">Apply for the pilot <ArrowRight /></Link></div>
      </section>
    </main>
  );
}
