"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CheckCircle2,
  FileCheck2,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  X,
} from "lucide-react";
import { sampleVentures } from "@/lib/sample-ventures";

export function VentureSandbox({ preview = false }: { preview?: boolean }) {
  const [query, setQuery] = useState("");
  const [sector, setSector] = useState("All sectors");
  const [region, setRegion] = useState("All regions");
  const [selectedId, setSelectedId] = useState(sampleVentures[0].id);

  const sectors = [...new Set(sampleVentures.map((item) => item.sector))];
  const regions = [...new Set(sampleVentures.map((item) => item.region))];
  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return sampleVentures.filter((venture) => {
      const searchable = [
        venture.name,
        venture.tagline,
        venture.sector,
        venture.city,
      ]
        .join(" ")
        .toLowerCase();
      return (
        (!normalized || searchable.includes(normalized)) &&
        (sector === "All sectors" || venture.sector === sector) &&
        (region === "All regions" || venture.region === region)
      );
    });
  }, [query, region, sector]);
  const visible = preview ? sampleVentures.slice(0, 3) : filtered;
  const selected =
    filtered.find((venture) => venture.id === selectedId) ?? filtered[0];
  const reset = () => {
    setQuery("");
    setSector("All sectors");
    setRegion("All regions");
  };

  return (
    <div className={`venture-sandbox ${preview ? "sandbox-preview" : ""}`}>
      <div className="sandbox-summary" aria-label="Synthetic data summary">
        <div>
          <Building2 />
          <strong>{sampleVentures.length}</strong>
          <span>fictional ventures</span>
        </div>
        <div>
          <FileCheck2 />
          <strong>
            {sampleVentures.reduce((sum, item) => sum + item.evidenceCount, 0)}
          </strong>
          <span>sample evidence links</span>
        </div>
        <div>
          <Target />
          <strong>
            {Math.round(
              sampleVentures.reduce((sum, item) => sum + item.readiness, 0) /
                sampleVentures.length,
            )}
            %
          </strong>
          <span>illustrative readiness</span>
        </div>
        <div>
          <ShieldCheck />
          <strong>100%</strong>
          <span>clearly synthetic</span>
        </div>
      </div>

      {!preview && (
        <div className="sandbox-filters" aria-label="Filter sample ventures">
          <label className="sandbox-search">
            <span>Search samples</span>
            <div>
              <Search aria-hidden="true" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Name, sector, city…"
              />
            </div>
          </label>
          <label>
            <span>Sector</span>
            <select value={sector} onChange={(event) => setSector(event.target.value)}>
              <option>All sectors</option>
              {sectors.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <label>
            <span>Region</span>
            <select value={region} onChange={(event) => setRegion(event.target.value)}>
              <option>All regions</option>
              {regions.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <button className="sandbox-reset" type="button" onClick={reset}>
            <X /> Reset
          </button>
        </div>
      )}

      <div className={preview ? "" : "sandbox-layout"}>
        <div className="venture-sample-grid" aria-live="polite">
          {visible.map((venture) => (
            <button
              type="button"
              className="venture-sample-card"
              data-tone={venture.tone}
              data-selected={!preview && selected?.id === venture.id}
              aria-pressed={!preview && selected?.id === venture.id}
              onClick={() => setSelectedId(venture.id)}
              key={venture.id}
            >
              <span className="sample-card-topline">
                <span className="venture-monogram">{venture.monogram}</span>
                <span className="synthetic-pill">
                  <Sparkles /> Synthetic
                </span>
              </span>
              <span className="venture-card-copy">
                <strong>{venture.name}</strong>
                <span>{venture.tagline}</span>
              </span>
              <span className="venture-tags">
                <span>{venture.sector}</span>
                <span>{venture.stage}</span>
              </span>
              <span className="sample-location">
                <MapPin /> {venture.city}
              </span>
              <span className="sample-progress-row">
                <span>
                  <strong>{venture.readiness}%</strong> readiness
                </span>
                <span>{venture.evidenceCount} evidence links</span>
              </span>
              <span className="sample-progress" aria-hidden="true">
                <i style={{ width: `${venture.readiness}%` }} />
              </span>
              <span className="sample-card-action">
                {preview ? "Preview record" : "Inspect sample"} <ArrowRight />
              </span>
            </button>
          ))}
          {!visible.length && (
            <div className="sandbox-empty">
              <Search />
              <strong>No sample ventures match those filters.</strong>
              <button type="button" onClick={reset}>
                Clear filters
              </button>
            </div>
          )}
        </div>

        {!preview && selected && (
          <aside className="venture-detail" id="sample-venture-detail" aria-live="polite">
            <div className="venture-detail-heading">
              <div>
                <span className="eyebrow">Selected synthetic record</span>
                <h3>{selected.name}</h3>
                <p>{selected.tagline}</p>
              </div>
              <span className="detail-score">
                <strong>{selected.matchScore}</strong>
                <small>sample match</small>
              </span>
            </div>
            <div className="detail-facts">
              <div>
                <TrendingUp />
                <span>Traction signal</span>
                <strong>{selected.traction}</strong>
              </div>
              <div>
                <Target />
                <span>Funding need</span>
                <strong>{selected.fundingNeed}</strong>
              </div>
            </div>
            <div className="detail-block">
              <span className="detail-label">Explainable match factors</span>
              <div className="detail-reasons">
                {selected.matchReasons.map((reason) => (
                  <span key={reason}>
                    <CheckCircle2 /> {reason}
                  </span>
                ))}
              </div>
            </div>
            <div className="detail-block">
              <span className="detail-label">Milestone trail</span>
              <div className="sample-timeline">
                {selected.milestones.map((milestone) => (
                  <div data-status={milestone.status} key={milestone.label}>
                    <i />
                    <span>
                      <strong>{milestone.label}</strong>
                      <small>{milestone.status}</small>
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="sample-gap">
              <Sparkles />
              <div>
                <strong>Illustrative next readiness gap</strong>
                <p>{selected.topGap}</p>
              </div>
            </div>
            <div className="detail-impact">
              {selected.impactGoals.map((goal) => (
                <span key={goal}>{goal}</span>
              ))}
            </div>
          </aside>
        )}
      </div>

      {preview && (
        <div className="sandbox-preview-cta">
          <p>
            Explore all six samples, filter the portfolio, and inspect readiness,
            evidence, milestones, gaps, and match factors.
          </p>
          <Link className="button button-primary" href="/demo#venture-sandbox">
            Open the venture sandbox <ArrowRight />
          </Link>
        </div>
      )}

      <p className="sandbox-disclaimer">
        <BadgeCheck /> Every name, metric, claim, milestone, and match shown here is
        fictional demonstration data—not pilot traction or an investment result.
      </p>
    </div>
  );
}
