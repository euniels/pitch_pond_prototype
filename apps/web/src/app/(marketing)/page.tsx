import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Building2,
  EyeOff,
  FileCheck2,
  Network,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
} from "lucide-react";
import { FeaturedVentures } from "@/components/featured-ventures";
import { ProductTour } from "@/components/product-tour";
import { pilotTargets } from "@/lib/content";
import { editorialMedia } from "@/lib/editorial-media";

const roleChapters = [
  {
    eyebrow: "For founders",
    title: "Turn the story into proof that can travel.",
    body: "Map readiness, connect claims to dated evidence, model measurable goals, and decide exactly what a potential supporter can see.",
    href: "/founder-studio",
    cta: "Enter Founder Studio",
    image: editorialMedia.founder,
    metric: "9",
    metricLabel: "readiness dimensions",
    icon: FileCheck2,
  },
  {
    eyebrow: "For investors and mentors",
    title: "See the fit before identity shapes the decision.",
    body: "Start with Blind First Look, inspect every compatibility factor, and request evidence or an introduction without receiving a black-box verdict.",
    href: "/matching",
    cta: "Explore explainable matching",
    image: editorialMedia.investor,
    metric: "100",
    metricLabel: "deterministic rubric points",
    icon: EyeOff,
  },
  {
    eyebrow: "For institutions",
    title: "Give every cohort a visible path forward.",
    body: "Coordinate founders and reviewers, monitor evidence freshness, and measure screening and introduction outcomes—not attendance alone.",
    href: "/institutions",
    cta: "Design an institutional pilot",
    image: editorialMedia.institution,
    metric: "4",
    metricLabel: "pilot outcome measures",
    icon: Building2,
  },
] as const;

export default function Home() {
  return (
    <main className="cinematic-home">
      <section className="cinematic-hero" aria-labelledby="home-title">
        <Image className="cinematic-hero-image" src={editorialMedia.hero.src} alt={editorialMedia.hero.alt} fill priority sizes="100vw" />
        <div className="cinematic-hero-shade" aria-hidden="true" />
        <div className="cinematic-light-shaft" aria-hidden="true" />
        <div className="shell cinematic-hero-inner">
          <div className="cinematic-hero-copy" data-reveal>
            <div className="pilot-badge dark-badge"><Sparkles /> CALABARZON pilot · Applications open</div>
            <h1 id="home-title">Build the proof.<em>Earn the right conversation.</em></h1>
            <p>PitchPond gives Filipino founders, investors, mentors, and institutions one evidence-backed place to understand readiness, explain fit, and project measurable goals.</p>
            <div className="cinematic-hero-actions">
              <Link className="button button-lime button-large" href="/pilot">Join the controlled pilot <ArrowRight /></Link>
              <Link className="button button-glass button-large" href="/demo">Explore the product</Link>
            </div>
          </div>
          <div className="hero-intelligence-card" aria-label="Synthetic venture intelligence preview" data-reveal>
            <span className="hero-card-kicker"><BarChart3 /> Synthetic intelligence preview</span>
            <div className="hero-card-score"><strong>74%</strong><span>goal attainment likelihood</span></div>
            <svg viewBox="0 0 420 150" role="img" aria-label="Illustrative forecast chart with P10, P50, and P90 paths">
              <defs><linearGradient id="heroArea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#35f2df" stopOpacity=".32" /><stop offset="1" stopColor="#35f2df" stopOpacity="0" /></linearGradient></defs>
              <path className="chart-grid" d="M12 30H408M12 75H408M12 120H408" />
              <path className="chart-band" d="M12 117C88 109 126 97 176 84C242 67 306 42 408 14L408 69C313 79 243 95 176 103C111 111 65 123 12 130Z" />
              <path className="chart-line chart-line-low" d="M12 122C89 115 126 107 176 100C243 91 308 78 408 64" />
              <path className="chart-line chart-line-main" d="M12 117C88 109 126 97 176 84C242 67 306 42 408 27" />
              <path className="chart-line chart-line-high" d="M12 112C91 101 128 87 176 69C242 45 312 24 408 10" />
            </svg>
            <div className="hero-card-legend"><span><i className="legend-actual" /> P50 path</span><span><i className="legend-band" /> P10–P90 range</span><span>Data confidence: 82</span></div>
            <small>Fictional data · not a company outcome estimate</small>
          </div>
          <div className="hero-scroll-cue" aria-hidden="true"><span /> Discover the system</div>
        </div>
      </section>

      <section className="credibility-rail" aria-label="PitchPond principles">
        <div className="shell credibility-grid">
          <div><ShieldCheck /><strong>Private by default</strong><span>Evidence stays permissioned.</span></div>
          <div><BadgeCheck /><strong>Evidence before claims</strong><span>Every assertion can show its proof.</span></div>
          <div><Target /><strong>Explain every percentage</strong><span>Rubrics, inputs, and limits stay visible.</span></div>
          <div><Users /><strong>Human-led decisions</strong><span>No automated investment verdicts.</span></div>
        </div>
      </section>

      <section className="cinematic-section venture-field-notes">
        <div className="shell">
          <div className="editorial-heading split-heading" data-reveal>
            <div><span className="eyebrow light">Six fictional ventures · one inspectable system</span><h2>See the business.<br /><em>Then see the evidence.</em></h2></div>
            <p>The imagery is fictional. The questions are real: What has been tested? What remains uncertain? Which evidence is fresh? Which supporter criteria genuinely fit?</p>
          </div>
          <FeaturedVentures />
          <div className="editorial-end-link"><Link className="text-cta light" href="/demo#venture-sandbox">Open the complete venture atlas <ArrowRight /></Link></div>
        </div>
      </section>

      <section className="cinematic-section role-narrative">
        <div className="shell">
          <div className="editorial-heading" data-reveal><span className="eyebrow light">One evidence layer · three perspectives</span><h2>Different decisions.<br /><em>The same traceable truth.</em></h2></div>
          <div className="role-chapter-list">
            {roleChapters.map(({ image, icon: Icon, ...chapter }, index) => (
              <article className="role-chapter" data-reveal key={chapter.title}>
                <div className="role-chapter-media"><Image src={image.src} alt={image.alt} fill sizes="(max-width: 760px) 100vw, 58vw" style={{ objectPosition: image.position }} /><span className="synthetic-media-badge"><ShieldCheck /> Fictional scene</span></div>
                <div className="role-chapter-copy">
                  <span className="chapter-index">0{index + 1}</span><span className="eyebrow light">{chapter.eyebrow}</span><h3>{chapter.title}</h3><p>{chapter.body}</p>
                  <div className="chapter-metric"><Icon /><strong>{chapter.metric}</strong><span>{chapter.metricLabel}</span></div>
                  <Link className="text-cta light" href={chapter.href}>{chapter.cta} <ArrowRight /></Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="intelligence-stage">
        <Image src={editorialMedia.network.src} alt="" fill sizes="100vw" aria-hidden="true" />
        <div className="intelligence-stage-shade" aria-hidden="true" />
        <div className="shell intelligence-stage-inner">
          <div className="intelligence-stage-copy" data-reveal>
            <span className="eyebrow light">Venture Intelligence</span><h2>A forecast is useful only when you can inspect what moves it.</h2>
            <p>Compare cautious, baseline, and accelerated paths. Separate readiness, compatibility, and goal attainment. Keep AI in the explanation—not inside the percentage.</p>
            <ul><li><span>P10 / P50 / P90</span> visible uncertainty bands</li><li><span>6–36 months</span> flexible operating horizons</li><li><span>Versioned</span> immutable calculation snapshots</li></ul>
            <Link className="button button-lime" href="/intelligence">Enter Venture Intelligence <ArrowRight /></Link>
          </div>
          <div className="intelligence-product-frame" data-reveal>
            <div className="frame-toolbar"><span /><span /><span /><small>Synthetic operating scenario</small></div>
            <div className="frame-metric-row"><div><small>Portfolio likelihood</small><strong>71%</strong><span>On track</span></div><div><small>Data confidence</small><strong>82</strong><span>Verified history</span></div><div><small>Readiness</small><strong>76%</strong><span>Independent measure</span></div></div>
            <svg viewBox="0 0 720 300" role="img" aria-label="Synthetic forecast showing actual results and three percentile paths">
              <path className="chart-grid" d="M24 48H696M24 116H696M24 184H696M24 252H696" /><path className="chart-band" d="M24 246C133 231 198 214 274 183C389 136 505 83 696 37L696 154C516 173 397 197 274 218C173 235 92 255 24 264Z" /><path className="chart-line chart-line-low" d="M24 251C132 240 199 228 274 210C394 181 510 167 696 149" /><path className="chart-line chart-line-main" d="M24 246C133 231 198 214 274 183C389 136 505 83 696 61" /><path className="chart-line chart-line-high" d="M24 237C139 217 204 193 274 156C397 91 522 48 696 28" /><path className="chart-actual" d="M24 246L88 235L150 226L211 207L274 183" /><line className="chart-target" x1="24" y1="92" x2="696" y2="92" />
            </svg>
            <div className="frame-driver-row"><span><i /> Retention cadence</span><span><i /> Evidence freshness</span><span><i /> Burn variability</span></div>
          </div>
        </div>
      </section>

      <section className="cinematic-section evidence-journey">
        <div className="shell evidence-journey-grid">
          <div className="evidence-journey-media" data-reveal><Image src={editorialMedia.evidence.src} alt={editorialMedia.evidence.alt} fill sizes="(max-width: 760px) 100vw, 50vw" /><div className="evidence-floating-card"><FileCheck2 /><div><strong>Evidence linked</strong><span>Customer renewal ledger · reviewed</span></div></div></div>
          <div className="evidence-journey-copy" data-reveal>
            <span className="eyebrow light">Evidence Vault</span><h2>A claim should get stronger when someone asks, “How do you know?”</h2><p>PitchPond turns scattered files into a controlled chain of context.</p>
            <ol><li><span>01</span><div><strong>State the claim</strong><p>Make the assertion specific enough to test.</p></div></li><li><span>02</span><div><strong>Link clean evidence</strong><p>Connect dated proof after validation and scanning.</p></div></li><li><span>03</span><div><strong>Grant the right view</strong><p>Share only what the review actually requires.</p></div></li><li><span>04</span><div><strong>Keep the audit trail</strong><p>Track reveals, grants, expiry, and revocation.</p></div></li></ol>
            <Link className="text-cta light" href="/evidence-vault">Explore the Evidence Vault <ArrowRight /></Link>
          </div>
        </div>
      </section>

      <section className="product-theatre"><div className="shell"><div className="editorial-heading split-heading" data-reveal><div><span className="eyebrow light">Interactive product theatre</span><h2>Move through the platform.<br /><em>Keep judgment human.</em></h2></div><p>Switch perspectives to see how one permissioned evidence layer supports a founder, a supporter, and a cohort manager.</p></div><ProductTour /></div></section>

      <section className="pilot-outcomes-cinematic"><div className="shell pilot-outcomes-inner"><div data-reveal><span className="eyebrow light">Measured pilot · not manufactured momentum</span><h2>Useful outcomes before attention metrics.</h2><p>Targets describe what the controlled pilot intends to validate. They are not accomplished traction.</p></div><div className="pilot-target-list">{pilotTargets.map((item, index) => <div key={item.label}><span>0{index + 1}</span><strong>{item.value}</strong><p>{item.label}</p></div>)}</div></div></section>

      <section className="cinematic-final-cta"><Image src={editorialMedia.network.src} alt="" fill sizes="100vw" aria-hidden="true" /><div className="cinematic-final-shade" aria-hidden="true" /><div className="shell" data-reveal><Network /><span className="eyebrow light">From potential to inspectable progress</span><h2>Build the proof behind the pitch.</h2><p>Join the controlled pilot as a founder, supporter, or institution.</p><div className="cinematic-hero-actions"><Link className="button button-lime button-large" href="/pilot">Apply for the pilot <ArrowRight /></Link><Link className="button button-glass button-large" href="/how-it-works">See how it works</Link></div></div></section>
    </main>
  );
}
