import Link from "next/link";
import { ArrowRight, Check, Minus } from "lucide-react";
import { TrustNote } from "@/components/trust-note";
import { pricingCopy } from "@/lib/content";
export const metadata = { title: "Pilot pricing" };
export default function Page() {
  const copy = pricingCopy;
  return (
    <main>
      <section className="page-hero ocean-hero">
        <div className="hero-rays" />
        <div className="shell narrow">
          <span className="eyebrow light">{copy.hero.eyebrow}</span>
          <h1>{copy.hero.title}</h1>
          <p>{copy.hero.body}</p>
        </div>
      </section>
      <section className="section shell">
        <div className="pricing-grid">
          {copy.plans.map((plan) => (
            <article
              key={plan.name}
              className={
                plan.featured ? "pricing-card featured" : "pricing-card"
              }
            >
              {plan.featured && <span className="plan-tag">Pilot focus</span>}
              <h2>{plan.name}</h2>
              <div className="price">
                <strong>{plan.price}</strong>
                <span>{plan.unit}</span>
              </div>
              <p>{plan.desc}</p>
              <ul>
                {plan.features.map((feature) => (
                  <li key={feature}>
                    <Check />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                className={
                  plan.featured
                    ? "button button-primary button-block"
                    : "button button-secondary button-block"
                }
                href="/pilot"
              >
                {plan.cta}
                <ArrowRight />
              </Link>
            </article>
          ))}
        </div>
        <div className="services-grid">
          {copy.services.map((service) => (
            <article key={service.title}>
              <h2>{service.title}</h2>
              <p>{service.body}</p>
            </article>
          ))}
        </div>
        <TrustNote>{copy.trust}</TrustNote>
        <div className="not-included">
          <Minus />
          <div>
            <strong>{copy.excludedTitle}</strong>
            <p>{copy.excludedBody}</p>
          </div>
        </div>
      </section>
    </main>
  );
}
