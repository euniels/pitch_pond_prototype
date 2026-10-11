"use client";

import Link from "next/link";
import { Check, Info, ShieldCheck } from "lucide-react";
import { useLocale } from "./app-providers";

const plans = [
  { name: "Basic Founder", price: "₱0", period: "/ month", fee: "5% success fee", description: "For a founder testing one clear community-backed idea.", features: ["Campaign builder", "Standard analytics", "Founder updates", "Community support"] },
  { name: "Pro Founder", price: "₱1,499", period: "/ month", fee: "3% success fee", description: "For an operating business running a stronger campaign program.", featured: true, features: ["Everything in Basic", "Advanced funnel analytics", "Campaign content tools", "Priority support"] },
  { name: "Backer Plus", price: "₱299", period: "/ month", fee: "No transaction discount", description: "For backers who want better organization and impact reporting.", features: ["Saved collections", "Enhanced alerts", "Downloadable impact reports", "Priority support"] },
];

export function PricingContent() {
  const { locale } = useLocale();
  return <div className="page-wrap"><section className="page-hero centered-hero"><div className="shell"><span className="eyebrow">Simple, visible pricing</span><h1>{locale === "fil" ? "Magbayad para sa mga tool—hindi para sa impluwensiya." : "Pay for useful tools, never influence."}</h1><p>Subscriptions do not buy rankings, special verification, or early campaign access.</p></div></section><section className="section shell"><div className="pricing-grid">{plans.map((plan) => <article className={`price-card ${plan.featured ? "featured" : ""}`} key={plan.name}>{plan.featured && <span className="popular-label">Best for growing founders</span>}<h2>{plan.name}</h2><p>{plan.description}</p><div className="price"><strong>{plan.price}</strong><span>{plan.period}</span></div><div className="success-fee">{plan.fee}</div><ul>{plan.features.map((feature) => <li key={feature}><Check /> {feature}</li>)}</ul><Link href="/signin" className={`button button-block ${plan.featured ? "button-primary" : "button-secondary"}`}>Join closed beta</Link></article>)}</div><div className="pricing-disclosure"><Info /><div><strong>Fees before confirmation</strong><p>Payment-processing and any shipping charges are itemized before a backer confirms. Platform fees apply only when an all-or-nothing campaign succeeds.</p></div><ShieldCheck /><div><strong>No pay-to-rank</strong><p>Discovery ordering is based on relevance and public campaign information, not a founder subscription.</p></div></div></section></div>;
}
