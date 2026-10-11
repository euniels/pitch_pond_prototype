"use client";

import Link from "next/link";
import { Check, LoaderCircle, RotateCcw, ShieldAlert } from "lucide-react";
import { useEffect, useState } from "react";
import { ApiError, browserApi } from "@/lib/api";
import type { Campaign, Paginated } from "@/lib/types";
import { formatMoney } from "@/lib/format";

export function AdminReviews() {
  const [items, setItems] = useState<Campaign[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  const load = () => browserApi<Paginated<Campaign>>("/api/v1/admin/campaign-reviews").then((response) => setItems(response.data)).catch((reason: ApiError) => setError(reason.status === 403 ? "This workspace requires reviewer access." : reason.message)).finally(() => setLoading(false));
  useEffect(() => { void load(); }, []);
  const decide = async (slug: string, decision: "approve" | "needs_changes") => { setLoading(true); setError(""); try { await browserApi(`/api/v1/admin/campaign-reviews/${slug}`, { method: "PATCH", body: JSON.stringify({ decision, note: decision === "approve" ? "Beta checklist reviewed." : "Please expand the evidence and fulfilment detail." }) }); await load(); } catch (reason) { setError((reason as ApiError).message); setLoading(false); } };
  return <div className="page-wrap"><section className="dashboard-header"><div className="shell dashboard-header-inner"><div><span className="eyebrow">Operations</span><h1>Campaign review queue</h1><p>Every decision creates an audit event.</p></div><Link href="/dashboard" className="button button-secondary">Dashboard</Link></div></section><section className="section shell">{loading && !items.length ? <div className="dashboard-loading"><LoaderCircle className="spin" /> Loading review cases…</div> : error ? <div className="empty-panel"><ShieldAlert /><h2>Cannot open queue</h2><p>{error}</p></div> : items.length ? <div className="review-table">{items.map((campaign) => <article key={campaign.id}><div><span className="eyebrow">{campaign.type} · {campaign.region}</span><h2>{campaign.title}</h2><p>{campaign.tagline}</p><div className="review-metrics"><span>{formatMoney(campaign.fundingGoalMinor)} goal</span><span>{campaign.durationDays} days</span><span>{campaign.rewards?.length ?? 0} rewards</span></div></div><div className="review-actions"><Link className="button button-secondary" href={`/campaigns/${campaign.slug}`}>Inspect</Link><button className="button button-secondary" onClick={() => decide(campaign.slug, "needs_changes")}><RotateCcw /> Request changes</button><button className="button button-primary" onClick={() => decide(campaign.slug, "approve")}><Check /> Approve</button></div></article>)}</div> : <div className="empty-panel"><Check /><h2>Review queue is clear</h2><p>No submitted campaigns are waiting right now.</p></div>}</section></div>;
}
