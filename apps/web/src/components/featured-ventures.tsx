import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, MapPin, ShieldCheck } from "lucide-react";
import { featuredVentures } from "@/lib/content";

export function FeaturedVentures() {
  return (
    <div className="venture-story-list">
      {featuredVentures.map((venture, index) => (
        <article className="venture-story" data-tone={venture.image.tone} key={venture.slug}>
          <div className="venture-story-media">
            <Image
              src={venture.image.src}
              alt={venture.image.alt}
              fill
              loading="lazy"
              sizes="(max-width: 760px) 100vw, 58vw"
              style={{ objectPosition: venture.image.position }}
            />
            <span className="synthetic-media-badge">
              <ShieldCheck /> Synthetic sample
            </span>
            <span className="venture-story-number">{String(index + 1).padStart(2, "0")}</span>
          </div>
          <div className="venture-story-copy">
            <span className="eyebrow">Venture field note</span>
            <div className="venture-tags">
              <span>{venture.sector}</span>
              <span>{venture.stage}</span>
            </div>
            <h3>{venture.name}</h3>
            <p>{venture.summary}</p>
            <span className="sample-location">
              <MapPin /> {venture.location}
            </span>
            <div className="venture-story-metrics">
              <div>
                <strong>{venture.readiness}%</strong>
                <span>readiness completion</span>
              </div>
              <div>
                <strong>{venture.evidence}</strong>
                <span>linked evidence records</span>
              </div>
            </div>
            <div className="featured-venture-progress">
              <div className="sample-progress" aria-hidden="true">
                <span style={{ width: `${venture.readiness}%` }} />
              </div>
            </div>
            <Link href="/demo#venture-sandbox">
              Inspect synthetic record <ArrowUpRight />
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}
