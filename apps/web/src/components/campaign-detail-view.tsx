"use client";

import Image from "next/image";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, BadgeCheck, CalendarDays, Check, Clock3, MapPin, PackageCheck, Share2, ShieldCheck, Users } from "lucide-react";
import type { Campaign } from "@/lib/types";
import { formatDate, formatMoney } from "@/lib/format";
import { useLocale } from "./app-providers";
import { BackCampaignPanel } from "./pledge-panel";

export function CampaignDetailView({ campaign }: { campaign: Campaign }) {
  const { locale } = useLocale();
  const fil = locale === "fil";
  return (
    <div className="campaign-page">
      <div className="shell campaign-breadcrumb"><Link href="/explore"><ArrowLeft size={16} /> {fil ? "Bumalik sa mga kampanya" : "Back to campaigns"}</Link><button onClick={() => navigator.share?.({ title: campaign.title, url: location.href })}><Share2 size={16} /> Share</button></div>
      <section className="shell campaign-hero-grid">
        <div className="campaign-detail-image"><Image src={campaign.coverImageUrl ?? "https://placehold.co/1200x800/e7f4ee/1f6b52?text=PitchPond"} alt="" fill priority sizes="(max-width: 900px) 100vw, 60vw" /></div>
        <div className="campaign-detail-summary">
          <div className="detail-badges"><span>{campaign.type === "reward" ? "Reward campaign" : "Donation campaign"}</span><span className="verified"><BadgeCheck size={15} /> Verified</span></div>
          <h1>{campaign.title}</h1>
          <p className="detail-tagline">{campaign.tagline}</p>
          <div className="detail-founder"><strong>{campaign.organization.displayName}</strong><span><MapPin size={15} /> {campaign.city}, {campaign.region}</span></div>
          <div className="progress-track progress-large"><span style={{ width: `${Math.min(campaign.fundedPercent, 100)}%` }} /></div>
          <div className="detail-funding"><div><strong>{formatMoney(campaign.raisedMinor)}</strong><span>raised of {formatMoney(campaign.fundingGoalMinor)}</span></div><strong>{campaign.fundedPercent}%</strong></div>
          <div className="detail-stats"><span><Users /> <strong>{campaign.backerCount}</strong> backers</span><span><Clock3 /> <strong>{campaign.daysLeft}</strong> days left</span><span><CalendarDays /> Ends {formatDate(campaign.endsAt)}</span></div>
          <div className="funding-rule"><ShieldCheck /><div><strong>All-or-nothing funding</strong><p>If the campaign does not meet its goal, paid backing enters the payment partner’s refund process.</p></div></div>
        </div>
      </section>

      <section className="section shell campaign-content-grid">
        <div className="campaign-story">
          <nav className="detail-tabs" aria-label="Campaign sections"><a href="#story">Story</a><a href="#rewards">Rewards</a><a href="#readiness">Readiness</a><a href="#updates">Updates</a></nav>
          <section id="story" className="story-section"><span className="eyebrow">The campaign</span><h2>Why this matters</h2><p>{campaign.story}</p></section>
          <section className="story-pair"><div><h3>Use of funds</h3><p>{campaign.useOfFunds}</p></div><div className="risk-card"><h3><AlertTriangle size={18} /> Risks to consider</h3><p>{campaign.risks}</p></div></section>
          <section id="rewards" className="story-section"><span className="eyebrow">What you can choose</span><h2>{campaign.type === "reward" ? "Reward tiers" : "Donation backing"}</h2>{campaign.rewards?.length ? <div className="reward-list">{campaign.rewards.map((reward) => <article key={reward.id} className="reward-card"><div><span>Back {formatMoney(reward.amountMinor)} or more</span><h3>{reward.title}</h3><p>{reward.description}</p></div><div className="reward-details"><span><PackageCheck /> {reward.shipsNationwide ? "Ships nationwide" : "Local fulfilment"}</span><span><CalendarDays /> Estimated {formatDate(reward.estimatedDeliveryAt)}</span>{reward.quantityTotal && <span>{reward.quantityTotal - reward.quantityClaimed} remaining</span>}</div></article>)}</div> : <p>No reward is required. Choose any amount above the campaign minimum.</p>}</section>
          <section id="readiness" className="story-section"><span className="eyebrow">Evidence, not prediction</span><h2>Campaign readiness</h2><p className="section-intro">This checklist describes submitted evidence. It is not a guarantee of success or fulfilment.</p><div className="readiness-list">{campaign.readinessChecks.map((check) => <div key={check.key} className={check.complete ? "complete" : "pending"}><span>{check.complete ? <Check /> : <Clock3 />}</span><strong>{check.label}</strong><small>{check.complete ? "Complete" : "Still needed"}</small></div>)}</div></section>
          <section id="updates" className="story-section"><span className="eyebrow">Accountability</span><h2>Founder updates</h2>{campaign.updates?.length ? campaign.updates.map((update) => <article className="update-card" key={update.id}><time>{formatDate(update.publishedAt)}</time><h3>{update.title}</h3><p>{update.body}</p></article>) : <div className="subtle-empty">No updates have been posted yet.</div>}</section>
        </div>
        <aside className="pledge-aside"><BackCampaignPanel campaign={campaign} /></aside>
      </section>
    </div>
  );
}
