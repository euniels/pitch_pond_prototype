"use client";

import { Search, SlidersHorizontal, X } from "lucide-react";
import { useMemo, useState } from "react";
import type { Campaign } from "@/lib/types";
import { CampaignCard } from "./campaign-card";
import { useLocale } from "./app-providers";

export function ExploreClient({ initialCampaigns }: { initialCampaigns: Campaign[] }) {
  const { locale } = useLocale();
  const fil = locale === "fil";
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [region, setRegion] = useState("all");
  const [category, setCategory] = useState("all");
  const regions = [...new Set(initialCampaigns.map((item) => item.region))].sort();
  const categories = [...new Set(initialCampaigns.map((item) => item.category))].sort();
  const filtered = useMemo(() => initialCampaigns.filter((item) => {
    const needle = search.toLowerCase();
    return (!needle || `${item.title} ${item.tagline} ${item.organization.displayName}`.toLowerCase().includes(needle))
      && (type === "all" || item.type === type)
      && (region === "all" || item.region === region)
      && (category === "all" || item.category === category);
  }), [category, initialCampaigns, region, search, type]);
  const reset = () => { setSearch(""); setType("all"); setRegion("all"); setCategory("all"); };

  return (
    <div className="page-wrap">
      <section className="page-hero compact-hero">
        <div className="shell"><span className="eyebrow">Nationwide discovery</span><h1>{fil ? "Tuklasin ang mga kampanya" : "Explore campaigns"}</h1><p>{fil ? "Mag-filter ayon sa rehiyon, uri, at kategorya. Basahin ang buong panganib bago sumuporta." : "Filter by region, type, and category. Review every campaign’s evidence and risks before backing."}</p></div>
      </section>
      <section className="section shell explore-layout">
        <aside className="filter-panel" aria-label="Campaign filters">
          <div className="filter-title"><SlidersHorizontal size={19} /><strong>Filters</strong>{(search || type !== "all" || region !== "all" || category !== "all") && <button onClick={reset}><X size={15} /> Reset</button>}</div>
          <label><span>Campaign type</span><select value={type} onChange={(e) => setType(e.target.value)}><option value="all">Donation + reward</option><option value="donation">Donation</option><option value="reward">Reward</option></select></label>
          <label><span>Region</span><select value={region} onChange={(e) => setRegion(e.target.value)}><option value="all">All Philippines</option>{regions.map((value) => <option key={value}>{value}</option>)}</select></label>
          <label><span>Category</span><select value={category} onChange={(e) => setCategory(e.target.value)}><option value="all">All categories</option>{categories.map((value) => <option key={value}>{value}</option>)}</select></label>
          <div className="filter-policy"><strong>Beta policy</strong><p>Equity and investment campaigns are not available.</p></div>
        </aside>
        <div className="explore-results">
          <div className="results-toolbar"><label className="search-box"><Search size={19} /><span className="sr-only">Search campaigns</span><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search title, founder, or purpose" /></label><span>{filtered.length} result{filtered.length === 1 ? "" : "s"}</span></div>
          {filtered.length ? <div className="campaign-grid campaign-grid-two">{filtered.map((campaign) => <CampaignCard key={campaign.id} campaign={campaign} />)}</div> : <div className="empty-panel"><Search /><h3>No campaigns match</h3><p>Try a broader search or reset the current filters.</p><button className="button button-secondary" onClick={reset}>Reset filters</button></div>}
        </div>
      </section>
    </div>
  );
}
