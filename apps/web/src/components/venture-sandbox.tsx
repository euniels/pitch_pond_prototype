"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowRight, BadgeCheck, Bookmark, Building2, Check, CheckCircle2, Eye,
  EyeOff, FileCheck2, FileText, GitCompareArrows, MapPin, Search,
  ShieldCheck, Sparkles, Target, TrendingUp, X,
} from "lucide-react";
import {
  sampleMatchFactors,
  sampleReadinessDimensions,
  sampleVentures,
  type SampleVenture,
} from "@/lib/sample-ventures";

type DetailTab = "overview" | "readiness" | "evidence" | "milestones";
type SortOption = "match" | "readiness" | "evidence" | "name";
const readinessOffsets = [6, -4, 8, -7, 3, -2, 5, -9, -5];

function readinessState(score: number) {
  if (score >= 84) return "Reviewed";
  if (score >= 67) return "Evidence linked";
  if (score >= 45) return "In progress";
  return "Not started";
}

function displayIdentity(venture: SampleVenture, blind: boolean) {
  const number = sampleVentures.findIndex((item) => item.id === venture.id) + 1;
  return {
    name: blind ? `Venture ${String(number).padStart(2, "0")}` : venture.name,
    monogram: blind ? "PP" : venture.monogram,
    location: blind ? venture.region : venture.city,
  };
}

export function VentureSandbox({ preview = false }: { preview?: boolean }) {
  const [query, setQuery] = useState("");
  const [sector, setSector] = useState("All sectors");
  const [region, setRegion] = useState("All regions");
  const [stage, setStage] = useState("All stages");
  const [readiness, setReadiness] = useState("Any readiness");
  const [sort, setSort] = useState<SortOption>("match");
  const [selectedId, setSelectedId] = useState(sampleVentures[0].id);
  const [detailTab, setDetailTab] = useState<DetailTab>("overview");
  const [blind, setBlind] = useState(false);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [compareIds, setCompareIds] = useState<string[]>([]);

  const sectors = [...new Set(sampleVentures.map((item) => item.sector))];
  const regions = [...new Set(sampleVentures.map((item) => item.region))];
  const stages = [...new Set(sampleVentures.map((item) => item.stage))];
  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const minimum = readiness === "80% and above" ? 80 : readiness === "70% and above" ? 70 : 0;
    return sampleVentures
      .filter((venture) => {
        const searchable = [venture.name, venture.tagline, venture.sector, venture.city, venture.region]
          .join(" ")
          .toLowerCase();
        return (
          (!normalized || searchable.includes(normalized)) &&
          (sector === "All sectors" || venture.sector === sector) &&
          (region === "All regions" || venture.region === region) &&
          (stage === "All stages" || venture.stage === stage) &&
          venture.readiness >= minimum
        );
      })
      .toSorted((a, b) => {
        if (sort === "name") return a.name.localeCompare(b.name);
        if (sort === "readiness") return b.readiness - a.readiness;
        if (sort === "evidence") return b.evidenceCount - a.evidenceCount;
        return b.matchScore - a.matchScore;
      });
  }, [query, readiness, region, sector, sort, stage]);
  const visible = preview ? sampleVentures.slice(0, 3) : filtered;
  const selected = filtered.find((venture) => venture.id === selectedId) ?? filtered[0];
  const compared = compareIds
    .map((id) => sampleVentures.find((venture) => venture.id === id))
    .filter((venture): venture is SampleVenture => Boolean(venture));

  const reset = () => {
    setQuery(""); setSector("All sectors"); setRegion("All regions");
    setStage("All stages"); setReadiness("Any readiness"); setSort("match");
  };
  const toggleSaved = (id: string) => setSavedIds((items) =>
    items.includes(id) ? items.filter((item) => item !== id) : [...items, id]);
  const toggleCompared = (id: string) => setCompareIds((items) => {
    if (items.includes(id)) return items.filter((item) => item !== id);
    return items.length < 3 ? [...items, id] : items;
  });
  const inspect = (id: string) => { setSelectedId(id); setDetailTab("overview"); };

  return (
    <div className={`venture-sandbox ${preview ? "sandbox-preview" : ""}`}>
      <div className="sandbox-summary" aria-label="Synthetic data summary">
        <div><Building2 /><strong>{sampleVentures.length}</strong><span>fictional ventures</span></div>
        <div><FileCheck2 /><strong>{sampleVentures.reduce((sum, item) => sum + item.evidenceCount, 0)}</strong><span>sample evidence links</span></div>
        <div><Target /><strong>{Math.round(sampleVentures.reduce((sum, item) => sum + item.readiness, 0) / sampleVentures.length)}%</strong><span>illustrative readiness</span></div>
        <div><ShieldCheck /><strong>100%</strong><span>clearly synthetic</span></div>
      </div>

      {!preview && <>
        <div className="sandbox-commandbar">
          <div><span className="eyebrow">Venture discovery workspace</span><p><strong>{filtered.length}</strong> of {sampleVentures.length} synthetic records · {savedIds.length} saved · {compareIds.length}/3 compared</p></div>
          <button className="blind-toggle" type="button" role="switch" aria-checked={blind} onClick={() => setBlind((value) => !value)}>
            {blind ? <EyeOff /> : <Eye />}<span><strong>Blind First Look</strong><small>{blind ? "Identity cues hidden" : "Identity cues visible"}</small></span><i aria-hidden="true" />
          </button>
        </div>
        <div className="sandbox-filters" aria-label="Filter sample ventures">
          <label className="sandbox-search"><span>Search samples</span><div><Search aria-hidden="true" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={blind ? "Sector, region, or need…" : "Name, sector, city…"} /></div></label>
          <label><span>Sector</span><select value={sector} onChange={(event) => setSector(event.target.value)}><option>All sectors</option>{sectors.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label><span>Region</span><select value={region} onChange={(event) => setRegion(event.target.value)}><option>All regions</option>{regions.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label><span>Stage</span><select value={stage} onChange={(event) => setStage(event.target.value)}><option>All stages</option>{stages.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label><span>Readiness</span><select value={readiness} onChange={(event) => setReadiness(event.target.value)}><option>Any readiness</option><option>70% and above</option><option>80% and above</option></select></label>
          <label><span>Sort by</span><select value={sort} onChange={(event) => setSort(event.target.value as SortOption)}><option value="match">Best match</option><option value="readiness">Readiness</option><option value="evidence">Evidence coverage</option><option value="name">Venture name</option></select></label>
          <button className="sandbox-reset" type="button" onClick={reset}><X /> Reset</button>
        </div>
      </>}

      <div className={preview ? "" : "sandbox-layout"}>
        <div className="venture-sample-grid" aria-live="polite">
          {visible.map((venture) => {
            const identity = displayIdentity(venture, blind && !preview);
            const saved = savedIds.includes(venture.id);
            const comparing = compareIds.includes(venture.id);
            return <article className="venture-sample-card" data-tone={venture.tone} data-selected={!preview && selected?.id === venture.id} key={venture.id}>
              <button className="venture-card-open" type="button" aria-pressed={!preview && selected?.id === venture.id} onClick={() => inspect(venture.id)}>
                <span className="sample-card-topline"><span className="venture-monogram">{identity.monogram}</span><span className="synthetic-pill"><Sparkles /> Synthetic</span></span>
                <span className="venture-card-copy"><strong>{identity.name}</strong><span>{venture.tagline}</span></span>
                <span className="venture-tags"><span>{venture.sector}</span><span>{venture.stage}</span></span>
                <span className="sample-location"><MapPin /> {identity.location}</span>
                <span className="sample-progress-row"><span><strong>{venture.readiness}%</strong> readiness</span><span>{venture.evidenceCount} evidence links</span></span>
                <span className="sample-progress" aria-hidden="true"><i style={{ width: `${venture.readiness}%` }} /></span>
                <span className="sample-card-action">{preview ? "Preview record" : "Inspect sample"} <ArrowRight /></span>
              </button>
              {!preview && <div className="venture-card-tools">
                <button type="button" data-active={saved} aria-label={`${saved ? "Remove" : "Save"} ${identity.name}`} onClick={() => toggleSaved(venture.id)}><Bookmark />{saved ? "Saved" : "Save"}</button>
                <button type="button" data-active={comparing} aria-label={`${comparing ? "Remove" : "Compare"} ${identity.name}`} disabled={!comparing && compareIds.length >= 3} onClick={() => toggleCompared(venture.id)}><GitCompareArrows />{comparing ? "Comparing" : "Compare"}</button>
              </div>}
            </article>;
          })}
          {!visible.length && <div className="sandbox-empty"><Search /><strong>No sample ventures match those filters.</strong><button type="button" onClick={reset}>Clear filters</button></div>}
        </div>
        {!preview && selected && <VentureDetail venture={selected} blind={blind} activeTab={detailTab} onTabChange={setDetailTab} />}
      </div>

      {!preview && compared.length > 0 && <section className="compare-tray" aria-label="Venture comparison">
        <div className="compare-heading"><div><span className="eyebrow">Side-by-side review</span><h3>Compare synthetic ventures</h3></div><button type="button" onClick={() => setCompareIds([])}><X /> Clear comparison</button></div>
        <div className="compare-grid">{compared.map((venture) => { const identity = displayIdentity(venture, blind); return <article key={venture.id}><button className="compare-remove" type="button" aria-label={`Remove ${identity.name} from comparison`} onClick={() => toggleCompared(venture.id)}><X /></button><strong>{identity.name}</strong><span>{venture.sector} · {venture.stage}</span><dl><div><dt>Readiness</dt><dd>{venture.readiness}%</dd></div><div><dt>Evidence</dt><dd>{venture.evidenceCount}</dd></div><div><dt>Sample fit</dt><dd>{venture.matchScore}/100</dd></div></dl><p>{venture.topGap}</p></article>; })}</div>
      </section>}

      {preview && <div className="sandbox-preview-cta"><p>Explore all eight samples, combine five filters, inspect evidence and milestones, try Blind First Look, save records, and compare ventures.</p><Link className="button button-primary" href="/demo#venture-sandbox">Open the venture sandbox <ArrowRight /></Link></div>}
      <p className="sandbox-disclaimer"><BadgeCheck /> Every name, metric, claim, milestone, document, and match shown here is fictional demonstration data—not pilot traction or an investment result.</p>
    </div>
  );
}

function VentureDetail({ venture, blind, activeTab, onTabChange }: { venture: SampleVenture; blind: boolean; activeTab: DetailTab; onTabChange: (tab: DetailTab) => void }) {
  const identity = displayIdentity(venture, blind);
  const tabs: readonly [DetailTab, string][] = [["overview", "Overview"], ["readiness", "Readiness"], ["evidence", "Evidence"], ["milestones", "Milestones"]];
  return <aside className="venture-detail" id="sample-venture-detail" aria-live="polite">
    <div className="venture-detail-heading"><div><span className="eyebrow">Selected synthetic record</span><h3>{identity.name}</h3><p>{venture.tagline}</p></div><span className="detail-score"><strong>{venture.matchScore}</strong><small>sample match</small></span></div>
    <div className="detail-tabs" role="tablist" aria-label="Venture record sections">{tabs.map(([id, label]) => <button key={id} type="button" role="tab" aria-selected={activeTab === id} onClick={() => onTabChange(id)}>{label}</button>)}</div>

    {activeTab === "overview" && <div className="detail-tab-panel" role="tabpanel">
      <div className="detail-facts"><div><TrendingUp /><span>Traction signal</span><strong>{venture.traction}</strong></div><div><Target /><span>Funding need</span><strong>{venture.fundingNeed}</strong></div></div>
      <div className="venture-profile-facts"><div><span>Founded</span><strong>{venture.founded}</strong></div><div><span>Team</span><strong>{venture.team}</strong></div><div><span>Business model</span><strong>{venture.businessModel}</strong></div></div>
      <div className="detail-block"><span className="detail-label">Deterministic match breakdown</span><div className="match-factor-mini">{sampleMatchFactors.map(([label, maximum], index) => <div key={label}><span><strong>{label}</strong><small>{venture.matchPoints[index]}/{maximum}</small></span><i><b style={{ width: `${(venture.matchPoints[index] / maximum) * 100}%` }} /></i></div>)}</div></div>
      <div className="detail-reasons">{venture.matchReasons.map((reason) => <span key={reason}><CheckCircle2 /> {reason}</span>)}</div>
      <div className="sample-gap"><Sparkles /><div><strong>Illustrative next readiness gap</strong><p>{venture.topGap}</p></div></div>
      <div className="detail-impact">{venture.impactGoals.map((goal) => <span key={goal}>{goal}</span>)}</div>
    </div>}

    {activeTab === "readiness" && <div className="detail-tab-panel readiness-detail" role="tabpanel"><p>Objective completion by the nine readiness dimensions. These are workflow states, not a prediction of fundraising success.</p>{sampleReadinessDimensions.map((dimension, index) => { const score = Math.max(32, Math.min(96, venture.readiness + readinessOffsets[index])); const state = readinessState(score); return <div key={dimension}><span><strong>{dimension}</strong><small>{state}</small></span><i><b style={{ width: `${score}%` }} /></i></div>; })}</div>}

    {activeTab === "evidence" && <div className="detail-tab-panel evidence-detail" role="tabpanel"><div className="evidence-security-note"><ShieldCheck /><p><strong>Private by default.</strong> These filenames are fictional. A real document would require a clean scan and an explicit, time-bound grant.</p></div>{venture.evidenceHighlights.map((item) => <div className="sample-evidence-row" key={item.title}><FileText /><span><strong>{item.title}</strong><small>{item.kind} · {item.status}</small></span>{item.status === "Reviewed" ? <Check /> : <FileCheck2 />}</div>)}<p className="evidence-count-note">Showing 3 illustrative highlights from {venture.evidenceCount} linked evidence records.</p></div>}

    {activeTab === "milestones" && <div className="detail-tab-panel" role="tabpanel"><div className="sample-timeline">{venture.milestones.map((milestone) => <div data-status={milestone.status} key={milestone.label}><i /><span><strong>{milestone.label}</strong><small>{milestone.status}</small></span></div>)}</div><div className="milestone-legend"><span><i data-status="verified" /> Evidence verified</span><span><i data-status="active" /> In progress</span><span><i data-status="planned" /> Planned</span></div></div>}
  </aside>;
}
