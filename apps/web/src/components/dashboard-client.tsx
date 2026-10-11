"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { BadgeCheck, CircleDollarSign, FileText, LoaderCircle, LogOut, Plus, ShieldAlert, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { ApiError, browserApi } from "@/lib/api";
import { formatMoney } from "@/lib/format";
import type { Campaign } from "@/lib/types";

type DashboardData = {
  user: { id: number; name: string; email: string; role: string; locale: string };
  organizations?: Array<{ id: number; display_name: string; verification_status: string }>;
  campaigns?: Campaign[];
  pledges?: Array<{ publicId: string; status: string; amountMinor: number; campaign: { slug: string; title: string } }>;
  totals: Record<string, number>;
};

export function DashboardClient() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState("");
  useEffect(() => { browserApi<{ data: DashboardData }>("/api/v1/dashboard").then((response) => setData(response.data)).catch((reason: ApiError) => { if (reason.status === 401) router.replace("/signin"); else setError(reason.message); }); }, [router]);
  const logout = async () => { await browserApi("/api/v1/auth/logout", { method: "POST", body: "{}" }); router.push("/"); router.refresh(); };
  if (error) return <div className="section shell empty-panel"><ShieldAlert /><h1>Dashboard unavailable</h1><p>{error}</p></div>;
  if (!data) return <div className="dashboard-loading"><LoaderCircle className="spin" /><span>Loading your secure workspace…</span></div>;

  const founder = data.user.role === "founder";
  const admin = ["admin", "reviewer"].includes(data.user.role);
  return <div className="dashboard-page"><header className="dashboard-header"><div className="shell dashboard-header-inner"><div><span className="eyebrow">{admin ? "Operations workspace" : founder ? "Founder workspace" : "Backer workspace"}</span><h1>Good to see you, {data.user.name.split(" ")[0]}.</h1><p>{data.user.email}</p></div><div className="dashboard-actions">{founder && <Link className="button button-primary" href="/founder/campaigns/new"><Plus /> New campaign</Link>}<button className="button button-secondary" onClick={logout}><LogOut /> Sign out</button></div></div></header><section className="section shell"><div className="dashboard-stats">{founder ? <><Stat icon={<CircleDollarSign />} value={formatMoney(data.totals.raisedMinor ?? 0)} label="Total raised" /><Stat icon={<Users />} value={data.totals.backers ?? 0} label="Backers" /><Stat icon={<FileText />} value={data.totals.activeCampaigns ?? 0} label="Live campaigns" /></> : admin ? <><Stat icon={<FileText />} value={data.totals.pendingCampaigns ?? 0} label="Campaign reviews" /><Stat icon={<BadgeCheck />} value={data.totals.verificationCases ?? 0} label="Verification cases" /><Stat icon={<Users />} value={data.totals.liveCampaigns ?? 0} label="Live campaigns" /></> : <><Stat icon={<CircleDollarSign />} value={formatMoney(data.totals.backedMinor ?? 0)} label="Backed" /><Stat icon={<FileText />} value={data.totals.campaignsBacked ?? 0} label="Campaigns backed" /></>}</div>{founder && <FounderPanel data={data} />}{admin && <AdminPanel data={data} />}{!founder && !admin && <BackerPanel data={data} />}</section></div>;
}

function Stat({ icon, value, label }: { icon: React.ReactNode; value: string | number; label: string }) { return <div className="dashboard-stat"><span>{icon}</span><div><strong>{value}</strong><small>{label}</small></div></div>; }
function FounderPanel({ data }: { data: DashboardData }) { return <div className="dashboard-grid"><section className="dashboard-panel"><div className="panel-heading"><h2>Campaigns</h2><Link href="/founder/campaigns/new">Create draft</Link></div>{data.campaigns?.length ? <div className="dashboard-list">{data.campaigns.map((campaign) => <Link href={`/campaigns/${campaign.slug}`} key={campaign.id}><div><strong>{campaign.title}</strong><span>{campaign.status.replace("_", " ")}</span></div><b>{campaign.fundedPercent}%</b></Link>)}</div> : <div className="subtle-empty">No campaign drafts yet.</div>}</section><section className="dashboard-panel"><h2>Verification</h2>{data.organizations?.map((org) => <div className="verification-summary" key={org.id}><BadgeCheck /><div><strong>{org.display_name}</strong><span>{org.verification_status.replace("_", " ")}</span></div></div>)}<p className="plain-note">Identity and business verification are separate from campaign approval.</p></section></div>; }
function BackerPanel({ data }: { data: DashboardData }) { return <section className="dashboard-panel"><div className="panel-heading"><h2>Your backing</h2><Link href="/explore">Explore more</Link></div>{data.pledges?.length ? <div className="dashboard-list">{data.pledges.map((pledge) => <Link href={`/campaigns/${pledge.campaign.slug}`} key={pledge.publicId}><div><strong>{pledge.campaign.title}</strong><span>{pledge.status.replace("_", " ")}</span></div><b>{formatMoney(pledge.amountMinor)}</b></Link>)}</div> : <div className="subtle-empty">You have not backed a campaign yet.</div>}</section>; }
function AdminPanel({ data }: { data: DashboardData }) { return <div className="dashboard-grid"><section className="dashboard-panel"><h2>Review queue</h2><p>{data.totals.pendingCampaigns ?? 0} campaign submissions need a documented decision.</p><Link href="/admin/reviews" className="button button-primary">Open campaign reviews</Link></section><section className="dashboard-panel"><h2>Operational safeguards</h2><ul className="check-list"><li><BadgeCheck /> Immutable admin audit events</li><li><BadgeCheck /> Idempotent payment webhooks</li><li><BadgeCheck /> Dual approval required for exceptional payouts</li></ul></section></div>; }
