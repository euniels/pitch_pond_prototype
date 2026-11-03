import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Building2,
  EyeOff,
  FileCheck2,
  Link2,
  Network,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
} from "lucide-react";
import { FeaturedVentures } from "@/components/featured-ventures";
import { ProductTour } from "@/components/product-tour";
import { SectionHeading } from "@/components/section-heading";
import { pilotTargets } from "@/lib/content";

const steps = [
  {
    icon: FileCheck2,
    number: "01",
    title: "Build the evidence",
    body: "Turn venture claims into a structured profile with dated proof, milestones, and visible gaps.",
  },
  {
    icon: Target,
    number: "02",
    title: "Understand readiness",
    body: "Use objective completion states and evidence coverage—not an opaque company-success score.",
  },
  {
    icon: Link2,
    number: "03",
    title: "Meet the right support",
    body: "Compare explicit criteria, review every fit factor, and request a permissioned introduction.",
  },
] as const;

const capabilities = [
  {
    icon: FileCheck2,
    title: "Evidence Vault",
    body: "Private, permissioned documents linked directly to the claims they support.",
  },
  {
    icon: Network,
    title: "Readiness Map",
    body: "Nine practical dimensions with objective states, evidence coverage, and reviewer context.",
  },
  {
    icon: Target,
    title: "Explainable matching",
    body: "A versioned rubric shows sector, stage, ticket, traction, geography, impact, and risk fit.",
  },
  {
    icon: BarChart3,
    title: "Goal projections",
    body: "Deterministic P10/P50/P90 trajectories and goal-attainment likelihood with full disclosures.",
  },
  {
    icon: EyeOff,
    title: "Blind First Look",
    body: "Review relevant venture facts before identity and prestige cues enter the decision.",
  },
  {
    icon: Building2,
    title: "Cohort oversight",
    body: "Give programs a measurable view of completion, screening, introductions, and outcomes.",
  },
] as const;

export default function Home() {
  return (
    <main className="marketing-home">
      <section className="home-hero">
        <div className="home-hero-ripples" aria-hidden="true" />
        <div className="shell home-hero-inner">
          <div className="pilot-badge">
            <Sparkles /> CALABARZON pilot · Applications open
          </div>
          <h1>
            Fundability before fundraising.
            <span>Proof before the pitch.</span>
          </h1>
          <p>
            PitchPond helps Filipino founders build evidence-backed ventures,
            understand readiness, project measurable goals, and meet investors,
            mentors, and programs whose criteria actually fit.
          </p>
          <div className="home-hero-actions">
            <Link className="button button-primary button-large" href="/pilot">
              Join the pilot <ArrowRight />
            </Link>
            <Link className="button button-secondary button-large" href="/demo">
              Explore the product
            </Link>
          </div>
          <div className="home-role-links" aria-label="Explore PitchPond by role">
            <span>See the experience for</span>
            <Link href="/founder-studio">Founders</Link>
            <Link href="/matching">Investors & mentors</Link>
            <Link href="/institutions">Institutions</Link>
          </div>
          <div className="home-trust-row">
            <span><ShieldCheck /> Private by default</span>
            <span><BadgeCheck /> Evidence before claims</span>
            <span><Users /> Human-led decisions</span>
          </div>
        </div>
      </section>

      <section className="pilot-metrics" aria-labelledby="pilot-objectives-title">
        <div className="shell">
          <div className="pilot-metrics-heading">
            <span className="eyebrow">Measured pilot—not vanity metrics</span>
            <p id="pilot-objectives-title">Validation targets, not accomplished traction.</p>
          </div>
          <div className="pilot-metric-grid">
            {pilotTargets.map((item) => (
              <article key={item.label}>
                <strong>{item.value}</strong>
                <span>{item.label}</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section home-featured-section">
        <div className="shell">
          <SectionHeading
            eyebrow="Synthetic pilot ventures"
            title="Realistic businesses. Clearly fictional data."
            intro="Explore how readiness, evidence, and matching can look across different Philippine ventures—without presenting demo records as real traction."
            center
          />
          <FeaturedVentures />
          <div className="center-actions">
            <Link className="button button-secondary" href="/demo#venture-sandbox">
              Explore all synthetic ventures <ArrowRight />
            </Link>
          </div>
        </div>
      </section>

      <section className="section home-steps-section">
        <div className="shell">
          <SectionHeading
            eyebrow="How PitchPond works"
            title="A clearer path from idea to qualified conversation."
            intro="Simple enough to start, structured enough to support real review."
            center
          />
          <div className="home-steps-grid">
            {steps.map(({ icon: Icon, number, title, body }) => (
              <article key={title}>
                <div className="home-step-icon"><Icon /></div>
                <span>Step {number}</span>
                <h3>{title}</h3>
                <p>{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section home-capabilities-section">
        <div className="shell">
          <SectionHeading
            eyebrow="One connected platform"
            title="Serious tools without opaque judgments."
            intro="Every workflow is designed to improve the quality of evidence and human decisions—not manufacture certainty."
            center
          />
          <div className="home-capability-grid">
            {capabilities.map(({ icon: Icon, title, body }) => (
              <article key={title}>
                <Icon />
                <h3>{title}</h3>
                <p>{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section home-tour-section">
        <div className="shell">
          <SectionHeading
            eyebrow="Interactive product tour"
            title="One platform, three clear perspectives."
            intro="Explore how the same permissioned evidence supports founders, investors and mentors, and ecosystem institutions."
          />
          <ProductTour />
        </div>
      </section>

      <section className="section pilot-proof-section">
        <div className="shell pilot-proof-grid">
          <div>
            <span className="eyebrow">What the pilot will measure</span>
            <h2>Useful outcomes—not attention metrics.</h2>
            <p>
              The pilot tests whether structured evidence shortens screening,
              improves founder preparation, and leads to better-qualified human
              conversations.
            </p>
            <Link className="text-cta" href="/institutions">
              Explore institutional pilots <ArrowRight />
            </Link>
          </div>
          <div className="pilot-proof-card">
            <div><strong>01</strong><span>Profile and evidence completion</span></div>
            <div><strong>02</strong><span>Reviewer screening time</span></div>
            <div><strong>03</strong><span>Match acceptance</span></div>
            <div><strong>04</strong><span>Introduction-to-meeting conversion</span></div>
          </div>
        </div>
      </section>

      <section className="home-final-cta">
        <div className="shell">
          <span className="eyebrow light">From potential to possible</span>
          <h2>Build the proof behind the pitch.</h2>
          <p>Join the controlled pilot as a founder, supporter, or institution.</p>
          <div className="home-hero-actions">
            <Link className="button button-lime button-large" href="/pilot">
              Apply for the pilot <ArrowRight />
            </Link>
            <Link className="button button-glass button-large" href="/how-it-works">
              See how it works
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
