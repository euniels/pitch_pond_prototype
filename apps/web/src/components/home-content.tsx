"use client";

import Link from "next/link";
import { ArrowRight, BadgeCheck, Banknote, Languages, LockKeyhole, MapPinned, ShieldCheck, Sparkles } from "lucide-react";
import type { Campaign } from "@/lib/types";
import { formatMoney } from "@/lib/format";
import { useLocale } from "./app-providers";
import { CampaignCard } from "./campaign-card";

export function HomeContent({ campaigns, apiAvailable }: { campaigns: Campaign[]; apiAvailable: boolean }) {
  const { locale } = useLocale();
  const fil = locale === "fil";
  const raised = campaigns.reduce((sum, item) => sum + item.raisedMinor, 0);
  const backers = campaigns.reduce((sum, item) => sum + item.backerCount, 0);

  return (
    <>
      {!apiAvailable && <div className="service-notice" role="status">Campaign service is starting. You can still review how PitchPond works.</div>}
      <section className="hero-section">
        <div className="hero-orb hero-orb-one" /><div className="hero-orb hero-orb-two" />
        <div className="shell hero-grid">
          <div className="hero-copy">
            <div className="eyebrow"><span className="live-dot" /> {fil ? "Saradong beta sa Pilipinas" : "Philippines closed beta"}</div>
            <h1>{fil ? <>Mga ideyang Pilipino, <em>sinusuportahan nang malinaw.</em></> : <>Filipino ideas, <em>backed with clarity.</em></>}</h1>
            <p>{fil ? "Tumulong sa mga beripikadong founder at komunidad sa pamamagitan ng malinaw na target, gantimpala, panganib, at regular na update." : "Support verified founders and communities through clear targets, honest risks, tangible rewards, and accountable updates."}</p>
            <div className="hero-actions">
              <Link href="/explore" className="button button-primary button-large">{fil ? "Tuklasin ang mga kampanya" : "Explore campaigns"}<ArrowRight size={18} /></Link>
              <Link href="/about" className="button button-quiet button-large">{fil ? "Paano ito gumagana" : "How it works"}</Link>
            </div>
            <div className="hero-trust">
              <span><ShieldCheck size={17} /> Verified founders</span>
              <span><LockKeyhole size={17} /> All-or-nothing</span>
              <span><Languages size={17} /> English + Filipino</span>
            </div>
          </div>
          <div className="hero-panel">
            <div className="hero-panel-top"><span>PitchPond pledge</span><BadgeCheck size={20} /></div>
            <blockquote>“Trust grows when every peso has a clear purpose.”</blockquote>
            <div className="hero-panel-steps">
              <div><b>01</b><span><strong>Review</strong>Verification, use of funds, risks</span></div>
              <div><b>02</b><span><strong>Back</strong>Choose an amount or limited reward</span></div>
              <div><b>03</b><span><strong>Follow</strong>Updates, delivery, and resolution</span></div>
            </div>
            <p className="plain-note">No equity investments are offered during beta. Payment partner approval is required before live-money launch.</p>
          </div>
        </div>
      </section>

      <section className="signal-strip" aria-label="Current platform data">
        <div className="shell signal-grid">
          <div><strong>{campaigns.length || "—"}</strong><span>visible campaigns</span></div>
          <div><strong>{campaigns.length ? formatMoney(raised) : "—"}</strong><span>shown as raised</span></div>
          <div><strong>{campaigns.length ? backers : "—"}</strong><span>recorded backers</span></div>
          <div><strong>100%</strong><span>all-or-nothing model</span></div>
        </div>
      </section>

      <section className="section shell">
        <div className="section-heading split-heading">
          <div><span className="eyebrow">Current opportunities</span><h2>{fil ? "Mga kampanyang puwedeng suportahan" : "Campaigns worth a closer look"}</h2></div>
          <Link href="/explore" className="text-link">View all <ArrowRight size={16} /></Link>
        </div>
        {campaigns.length ? <div className="campaign-grid">{campaigns.map((campaign) => <CampaignCard key={campaign.id} campaign={campaign} />)}</div> : <div className="empty-panel"><Sparkles /><h3>No campaigns are live yet</h3><p>Verified campaigns will appear here once the API is running and an admin approves them.</p></div>}
      </section>

      <section className="section warm-section">
        <div className="shell">
          <div className="section-heading centered"><span className="eyebrow">Designed for confidence</span><h2>Less hype. More useful evidence.</h2><p>PitchPond shows what is known, what is still being reviewed, and what every backer should consider.</p></div>
          <div className="feature-grid">
            <div className="feature-card"><BadgeCheck /><h3>Layered verification</h3><p>Identity and business checks are separate, visible, and never presented as a guarantee.</p></div>
            <div className="feature-card"><Banknote /><h3>Clear money flow</h3><p>Goals, fees, payment status, refund state, and founder payout state have explicit records.</p></div>
            <div className="feature-card"><MapPinned /><h3>Built for the Philippines</h3><p>Nationwide participation, peso-first amounts, regional discovery, and a Luzon-led pilot.</p></div>
          </div>
        </div>
      </section>

      <section className="section shell founder-callout">
        <div><span className="eyebrow">For founders</span><h2>Build a campaign people can understand.</h2><p>Work through identity, business details, rewards, risks, budget, and fulfilment before asking the public to contribute.</p></div>
        <Link href="/founder/campaigns/new" className="button button-primary button-large">Start a draft <ArrowRight size={18} /></Link>
      </section>
    </>
  );
}
