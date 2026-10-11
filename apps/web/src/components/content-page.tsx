import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
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
  cta = "Apply for the pilot",
  children,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  items: readonly ContentPageItem[];
  note: string;
  cta?: string;
  children?: React.ReactNode;
}) {
  return (
    <main>
      <section className="page-hero ocean-hero">
        <div className="hero-rays" />
        <div className="shell narrow">
          <span className="eyebrow light">{eyebrow}</span>
          <h1>{title}</h1>
          <p>{intro}</p>
          <div className="hero-actions">
            <Link className="button button-lime button-large" href="/pilot">
              {cta}
              <ArrowRight />
            </Link>
            <Link className="button button-glass button-large" href="/demo">
              See the product tour
            </Link>
          </div>
        </div>
      </section>
      <section className="section shell">
        <div className="content-card-grid">
          {items.map(
            ({ icon: Icon, title: itemTitle, body, points }, index) => (
              <article className="content-card" key={itemTitle}>
                <span className="card-number">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <Icon />
                <h2>{itemTitle}</h2>
                <p>{body}</p>
                {points && (
                  <ul>
                    {points.map((point) => (
                      <li key={point}>
                        <CheckCircle2 />
                        {point}
                      </li>
                    ))}
                  </ul>
                )}
              </article>
            ),
          )}
        </div>
        <TrustNote>{note}</TrustNote>
        {children}
      </section>
    </main>
  );
}
