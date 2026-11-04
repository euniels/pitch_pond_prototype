import Image from "next/image";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, CheckCircle2, ShieldCheck } from "lucide-react";
import type { EditorialMedia } from "@/lib/editorial-media";
import { TrustNote } from "./trust-note";

export type ContentPageItem = {
  icon: LucideIcon;
  title: string;
  body: string;
  points?: readonly string[];
};

export function ContentPage({
  eyebrow,
  title,
  intro,
  items,
  note,
  media,
  chapterLabel = "Inside the workflow",
  cta = "Apply for the pilot",
  children,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  items: readonly ContentPageItem[];
  note: string;
  media: EditorialMedia;
  chapterLabel?: string;
  cta?: string;
  children?: React.ReactNode;
}) {
  return (
    <main className="editorial-content-page">
      <section className="editorial-page-hero">
        <div className="editorial-page-media">
          <Image src={media.src} alt={media.alt} fill priority sizes="(max-width: 800px) 100vw, 58vw" style={{ objectPosition: media.position }} />
          <span className="synthetic-media-badge"><ShieldCheck /> Fictional scene</span>
        </div>
        <div className="editorial-page-shade" aria-hidden="true" />
        <div className="shell editorial-page-hero-inner">
          <div data-reveal>
            <span className="eyebrow light">{eyebrow}</span>
            <h1>{title}</h1>
            <p>{intro}</p>
            <div className="hero-actions">
              <Link className="button button-lime button-large" href="/pilot">{cta}<ArrowRight /></Link>
              <Link className="button button-glass button-large" href="/demo">See the product tour</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="editorial-workflow-section">
        <div className="shell">
          <div className="editorial-workflow-heading" data-reveal>
            <span className="eyebrow light">{chapterLabel}</span>
            <h2>Structure the work.<br /><em>Keep the reasoning visible.</em></h2>
            <p>{note}</p>
          </div>
          <div className="editorial-workflow-grid">
            {items.map(({ icon: Icon, title: itemTitle, body, points }, index) => (
              <article className="editorial-workflow-card" data-featured={index === 0 || index === 3} data-reveal key={itemTitle}>
                <div className="workflow-card-top"><span>{String(index + 1).padStart(2, "0")}</span><Icon /></div>
                <h3>{itemTitle}</h3>
                <p>{body}</p>
                {points && <ul>{points.map((point) => <li key={point}><CheckCircle2 />{point}</li>)}</ul>}
              </article>
            ))}
          </div>
          <TrustNote>{note}</TrustNote>
          {children}
        </div>
      </section>
    </main>
  );
}
