import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BrainCircuit,
  Building2,
  Eye,
  FileCheck2,
  Link2,
  LineChart,
  Network,
  PackageCheck,
  Repeat2,
  Route,
  ShieldCheck,
  Users,
} from "lucide-react";
import { ProductTour } from "@/components/product-tour";
import { SectionHeading } from "@/components/section-heading";
import { BrandMarkImage } from "@/components/brand";
import { VentureSandbox } from "@/components/venture-sandbox";
import { homeCopy, pilotTargets, readinessDimensions } from "@/lib/content";

export default function Home() {
  const copy = homeCopy;
  const workflowIcons = {
    route: Route,
    evidence: FileCheck2,
    network: Network,
    ai: BrainCircuit,
    people: Users,
  };
  return (
    <main>
      <section className="hero ocean-hero">
        <div className="hero-rays" />
        <div className="hero-ripples" />
        <div className="hero-bubbles" aria-hidden="true" />
        <div className="hero-skyline" aria-hidden="true" />
        <div className="shell hero-grid">
          <div className="hero-copy">
            <div className="eyebrow light">
              <span className="pulse-dot" />
              {copy.hero.eyebrow}
            </div>
            <h1>
              {copy.hero.title}
              <br />
              <em>{copy.hero.titleAccent}</em>
            </h1>
            <p>{copy.hero.intro}</p>
            <div className="hero-actions">
              <Link className="button button-lime button-large" href="/pilot">
                {copy.hero.primaryCta}
                <ArrowRight />
              </Link>
              <Link className="button button-glass button-large" href="/demo">
                {copy.hero.secondaryCta}
              </Link>
            </div>
            <div className="hero-principles">
              <span>
                <ShieldCheck />
                {copy.hero.principles[0]}
              </span>
              <span>
                <Eye />
                {copy.hero.principles[1]}
              </span>
              <span>
                <BadgeCheck />
                {copy.hero.principles[2]}
              </span>
            </div>
          </div>
          <div
            className="hero-visual"
            aria-label="PitchPond fundability workflow"
          >
            <div className="hero-visual-glow" aria-hidden="true" />
            <div className="pond-orbit orbit-one" />
            <div className="pond-orbit orbit-two" />
            <div className="hero-core">
              <BrandMarkImage className="hero-brand-symbol" priority />
              <strong>
                Fundability
                <br />
                Graph
              </strong>
              <small>claims · evidence · gaps · fit</small>
            </div>
            {[
              ["Readiness", Route],
              ["Evidence", FileCheck2],
              ["Thesis", Users],
              ["Matches", Link2],
            ].map(([label, Icon], index) => (
              <div
                className={`orbit-label orbit-label-${index + 1}`}
                key={String(label)}
              >
                {typeof Icon !== "string" && <Icon />}
                <span>{String(label)}</span>
              </div>
            ))}
            <div className="hero-mantra" aria-hidden="true">
              <span>Ideas</span>
              <span>People</span>
              <span>Capital</span>
              <strong>A brighter Philippines</strong>
            </div>
          </div>
        </div>
      </section>
      <section className="pilot-strip">
        <div className="shell pilot-targets">
          <div>
            <span className="eyebrow">{copy.pilotStrip.eyebrow}</span>
            <p>{copy.pilotStrip.body}</p>
          </div>
          {pilotTargets.map((item) => (
            <div key={item.label}>
              <strong>{item.value}</strong>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </section>
      <section className="section shell feature-section">
        <SectionHeading
          eyebrow={copy.workflow.eyebrow}
          title={copy.workflow.title}
          intro={copy.workflow.intro}
          center
        />
        <div className="workflow-grid">
          {copy.workflow.items.map(([icon, num, title, body]) => {
            const Icon = workflowIcons[icon];
            return (
              <article key={title}>
                <span>{num}</span>
                <Icon />
                <h3>{title}</h3>
                <p>{body}</p>
              </article>
            );
          })}
        </div>
      </section>
      <section className="section section-dark">
        <div className="shell">
          <SectionHeading
            eyebrow={copy.tour.eyebrow}
            title={copy.tour.title}
            intro={copy.tour.intro}
          />
          <ProductTour />
        </div>
      </section>
      <section className="section sample-showcase-section">
        <div className="shell">
          <SectionHeading
            eyebrow="Synthetic pilot sandbox"
            title="A credible venture pipeline—before any live data enters the pond."
            intro="Explore fictional Philippine businesses built to demonstrate evidence coverage, readiness gaps, milestone history, and explainable investor fit."
          />
          <VentureSandbox preview />
        </div>
      </section>
      <section className="section intelligence-teaser-section">
        <div className="shell intelligence-teaser">
          <div>
            <span className="eyebrow light">Assumption-based venture intelligence</span>
            <h2>Project progress without pretending to predict success.</h2>
            <p>
              Model readiness, evidence, and milestone trajectories over time.
              Founders see what to strengthen; investors and mentors see which
              assumptions drive the picture.
            </p>
            <Link className="button button-lime" href="/intelligence">
              Open Venture Intelligence <ArrowRight />
            </Link>
          </div>
          <div className="intelligence-teaser-cards">
            <div><LineChart /><span>Now</span><strong>Startup progress scenarios</strong><small>Transparent ranges—not success odds</small></div>
            <div><PackageCheck /><span>Future</span><strong>Microbusiness launch systems</strong><small>Ready-to-operate packages with verified assumptions</small></div>
            <div><Repeat2 /><span>Future</span><strong>SME continuity pathways</strong><small>Responsible ownership transition workflows</small></div>
          </div>
        </div>
      </section>
      <section className="section shell readiness-section">
        <div>
          <SectionHeading
            eyebrow={copy.readiness.eyebrow}
            title={copy.readiness.title}
            intro={copy.readiness.intro}
          />
          <Link className="text-cta" href="/founder-studio">
            {copy.readiness.cta} <ArrowRight />
          </Link>
        </div>
        <div className="dimension-list">
          {readinessDimensions.map(([title, body], index) => (
            <div key={title}>
              <span>{index + 1}</span>
              <div>
                <strong>{title}</strong>
                <p>{body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
      <section className="section ecosystem-section">
        <div className="shell ecosystem-grid">
          <div>
            <span className="eyebrow">{copy.ecosystem.eyebrow}</span>
            <h2>{copy.ecosystem.title}</h2>
            <p>{copy.ecosystem.body}</p>
            <Link className="button button-secondary" href="/institutions">
              {copy.ecosystem.cta}
              <ArrowRight />
            </Link>
          </div>
          <div className="ecosystem-card">
            <Building2 />
            <h3>{copy.ecosystem.cardTitle}</h3>
            <ul>
              {copy.ecosystem.measures.map((measure) => (
                <li key={measure}>{measure}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>
      <section className="final-cta">
        <div className="shell">
          <span className="eyebrow light">{copy.finalCta.eyebrow}</span>
          <h2>{copy.finalCta.title}</h2>
          <p>{copy.finalCta.body}</p>
          <div className="hero-actions">
            <Link className="button button-lime button-large" href="/pilot">
              {copy.finalCta.primary}
              <ArrowRight />
            </Link>
            <Link
              className="button button-glass button-large"
              href="/how-it-works"
            >
              {copy.finalCta.secondary}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
