import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, MapPin, ShieldCheck } from "lucide-react";
import { featuredVentures } from "@/lib/content";

export function FeaturedVentures() {
  return (
    <div className="featured-venture-grid">
      {featuredVentures.map((venture) => (
        <article className="featured-venture-card" key={venture.slug}>
          <div className="featured-venture-image">
            <Image
              src={venture.image.src}
              alt={venture.image.alt}
              fill
              loading={venture.slug === "amihan-cold-chain" ? "eager" : "lazy"}
              sizes="(max-width: 760px) 100vw, (max-width: 1100px) 50vw, 390px"
              style={{ objectPosition: venture.image.position }}
            />
            <span className="synthetic-media-badge">
              <ShieldCheck /> Synthetic sample
            </span>
          </div>
          <div className="featured-venture-body">
            <div className="venture-tags">
              <span>{venture.sector}</span>
              <span>{venture.stage}</span>
            </div>
            <h3>{venture.name}</h3>
            <p>{venture.summary}</p>
            <span className="sample-location">
              <MapPin /> {venture.location}
            </span>
            <div className="featured-venture-progress">
              <div>
                <span>{venture.readiness}% readiness</span>
                <span>{venture.evidence} evidence links</span>
              </div>
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
