"use client";

import { useState } from "react";
import {
  BadgeCheck,
  Building2,
  Eye,
  EyeOff,
  FileKey2,
  Network,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { demoThesis, demoVenture, demoWorkspace } from "@/lib/demo-data";
import { redactForBlindReview } from "@/lib/blind-review";
import { FundabilityGraph } from "./fundability-graph";
import { ReadinessMap } from "./readiness-map";
import { MatchBreakdown } from "./match-breakdown";
import { formatPeso } from "@/lib/format";

type View = "founder" | "supporter" | "institution";

export function ProductTour({ full = false }: { full?: boolean }) {
  const [view, setView] = useState<View>("founder");
  const [revealed, setRevealed] = useState(false);
  const blind = redactForBlindReview(demoVenture);
  return (
    <section
      className={`product-tour ${full ? "product-tour-full" : ""}`}
      aria-label="Interactive product tour"
    >
      <div
        className="tour-tabs"
        role="tablist"
        aria-label="Workspace perspective"
      >
        <button
          role="tab"
          aria-selected={view === "founder"}
          onClick={() => setView("founder")}
        >
          <Network />
          Founder
        </button>
        <button
          role="tab"
          aria-selected={view === "supporter"}
          onClick={() => setView("supporter")}
        >
          <Users />
          Investor / mentor
        </button>
        <button
          role="tab"
          aria-selected={view === "institution"}
          onClick={() => setView("institution")}
        >
          <Building2 />
          Institution
        </button>
      </div>
      <div className="tour-window">
        <div className="tour-toolbar">
          <span />
          <span />
          <span />
          <small>Illustrative product tour · synthetic data</small>
        </div>
        {view === "founder" && (
          <div className="tour-panel">
            <div className="tour-title">
              <div>
                <span className="eyebrow">Founder Studio</span>
                <h3>{demoVenture.name}</h3>
                <p>{demoVenture.tagline}</p>
              </div>
              <span className="status-pill">
                <BadgeCheck />
                Private pilot profile
              </span>
            </div>
            <div className="tour-two">
              <FundabilityGraph
                venture={demoVenture}
                claimsCount={7}
                milestonesCount={4}
                matchFactorCount={7}
                compact
              />
              <div>
                <div className="mini-stat-row">
                  <div>
                    <strong>27</strong>
                    <span>fields complete</span>
                  </div>
                  <div>
                    <strong>22</strong>
                    <span>evidence links</span>
                  </div>
                  <div>
                    <strong>3</strong>
                    <span>readiness gaps</span>
                  </div>
                </div>
                <div className="ai-advisory">
                  <Sparkles />
                  <div>
                    <strong>Advisory readiness review</strong>
                    <p>
                      Strengthen financial assumptions and document the
                      ownership of core technology before your next
                      introduction.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <ReadinessMap items={demoVenture.readiness} />
          </div>
        )}
        {view === "supporter" && (
          <div className="tour-panel">
            <div className="tour-title">
              <div>
                <span className="eyebrow">Explainable match</span>
                <h3>{revealed ? demoVenture.name : blind.name}</h3>
                <p>{demoVenture.tagline}</p>
              </div>
              <button
                className="button button-secondary button-small"
                onClick={() => setRevealed(!revealed)}
              >
                {revealed ? <EyeOff /> : <Eye />}
                {revealed ? "Return to blind view" : "Reveal with audit"}
              </button>
            </div>
            <div className="blind-banner">
              <ShieldCheck />
              <div>
                <strong>
                  {revealed
                    ? "Identity reveal recorded"
                    : "Blind First Look is active"}
                </strong>
                <p>
                  {revealed
                    ? "The reviewer’s reason and timestamp would be added to the immutable audit log."
                    : "Names, logos, exact location, and prestige cues stay hidden during the first review."}
                </p>
              </div>
            </div>
            <MatchBreakdown result={demoWorkspace.matches![0].result} />
            <p className="tour-footnote">
              The narrative may be AI-assisted, but the{" "}
              {demoWorkspace.matches![0].result.score}/100 compatibility result
              comes only from rubric{" "}
              {demoWorkspace.matches![0].result.rubricVersion}.
            </p>
          </div>
        )}
        {view === "institution" && (
          <div className="tour-panel">
            <div className="tour-title">
              <div>
                <span className="eyebrow">Institution workspace</span>
                <h3>{demoWorkspace.cohort!.name}</h3>
                <p>Progress and outcomes for a consent-based founder cohort.</p>
              </div>
              <span className="status-pill">
                <FileKey2 />6 assigned reviewers
              </span>
            </div>
            <div className="cohort-stats">
              <div>
                <strong>{demoWorkspace.cohort!.founders}</strong>
                <span>founders</span>
              </div>
              <div>
                <strong>{demoWorkspace.cohort!.completion}%</strong>
                <span>median completion</span>
              </div>
              <div>
                <strong>{demoWorkspace.cohort!.introductions}</strong>
                <span>introductions</span>
              </div>
              <div>
                <strong>42 min</strong>
                <span>median screening time</span>
              </div>
            </div>
            <div
              className="cohort-table"
              role="table"
              aria-label="Synthetic cohort progress"
            >
              <div role="row">
                <span>Venture</span>
                <span>Readiness</span>
                <span>Evidence</span>
                <span>Review</span>
              </div>
              {[
                ["Circular food systems", 76, "18 linked", "In review"],
                ["Rural health logistics", 68, "14 linked", "Assigned"],
                ["Inclusive skills platform", 51, "9 linked", "Needs evidence"],
              ].map((row) => (
                <div role="row" key={String(row[0])}>
                  <strong>{row[0]}</strong>
                  <span>
                    <i style={{ width: `${row[1]}%` }} /> {row[1]}%
                  </span>
                  <span>{row[2]}</span>
                  <span>{row[3]}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      {full && (
        <div className="tour-context">
          <div>
            <span className="eyebrow">Example thesis</span>
            <h3>{demoThesis.sectors.join(" + ")}</h3>
          </div>
          <div>
            <strong>
              {formatPeso(demoThesis.ticketMin)}–
              {formatPeso(demoThesis.ticketMax)}
            </strong>
            <span>explicit ticket range</span>
          </div>
          <div>
            <strong>{demoThesis.regions.join(" · ")}</strong>
            <span>preferred geography</span>
          </div>
        </div>
      )}
    </section>
  );
}
