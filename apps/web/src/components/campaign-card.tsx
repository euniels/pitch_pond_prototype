"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, CheckCircle2, Clock3, MapPin, Users } from "lucide-react";
import type { Campaign } from "@/lib/types";
import { formatMoney } from "@/lib/format";
import { useLocale } from "./app-providers";

export function CampaignCard({ campaign }: { campaign: Campaign }) {
  const { locale, t } = useLocale();
  const numberLocale = locale === "fil" ? "fil-PH" : "en-PH";
  return (
    <article className="campaign-card">
      <Link href={`/campaigns/${campaign.slug}`} className="campaign-image-wrap" aria-label={`View ${campaign.title}`}>
        <Image
          src={campaign.coverImageUrl ?? "https://placehold.co/1000x700/e7f4ee/1f6b52?text=PitchPond"}
          alt=""
          fill
          sizes="(max-width: 760px) 100vw, (max-width: 1100px) 50vw, 33vw"
          className="campaign-image"
        />
        <span className="campaign-type">{campaign.type === "reward" ? "Reward" : "Donation"}</span>
      </Link>
      <div className="campaign-card-body">
        <div className="verified-line"><CheckCircle2 size={15} /> {t("verified")}</div>
        <Link href={`/campaigns/${campaign.slug}`}><h3>{campaign.title}</h3></Link>
        <p className="campaign-tagline">{campaign.tagline}</p>
        <div className="campaign-location"><MapPin size={15} /> {campaign.city ? `${campaign.city}, ` : ""}{campaign.region}</div>
        <div className="progress-track" aria-label={`${campaign.fundedPercent}% funded`}>
          <span style={{ width: `${Math.min(campaign.fundedPercent, 100)}%` }} />
        </div>
        <div className="campaign-money">
          <div><strong>{formatMoney(campaign.raisedMinor, numberLocale)}</strong><span>{t("raised")} of {formatMoney(campaign.fundingGoalMinor, numberLocale)}</span></div>
          <strong>{campaign.fundedPercent}%</strong>
        </div>
        <div className="campaign-meta">
          <span><Users size={15} /> {campaign.backerCount} {t("backers")}</span>
          <span><Clock3 size={15} /> {campaign.daysLeft ?? 0} {t("daysLeft")}</span>
          <ArrowUpRight size={18} className="campaign-arrow" />
        </div>
      </div>
    </article>
  );
}
