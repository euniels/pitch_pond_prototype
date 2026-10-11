"use client";

import Link from "next/link";
import { CheckCircle2, ChevronRight, LoaderCircle, LockKeyhole } from "lucide-react";
import { useMemo, useState } from "react";
import { ApiError, browserApi } from "@/lib/api";
import { formatMoney } from "@/lib/format";
import type { Campaign } from "@/lib/types";

type PledgeResponse = { data: { publicId: string; checkoutUrl: string | null; simulated: boolean; status: string } };

export function BackCampaignPanel({ campaign }: { campaign: Campaign }) {
  const [rewardId, setRewardId] = useState<number | null>(campaign.rewards?.[0]?.id ?? null);
  const selected = campaign.rewards?.find((reward) => reward.id === rewardId);
  const [amount, setAmount] = useState(((selected?.amountMinor ?? campaign.minimumPledgeMinor) / 100).toString());
  const [anonymous, setAnonymous] = useState(false);
  const [shipping, setShipping] = useState({ recipient: "", line1: "", city: "", region: "", postalCode: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pledge, setPledge] = useState<PledgeResponse["data"] | null>(null);
  const [complete, setComplete] = useState(false);
  const amountMinor = Math.round(Number(amount || 0) * 100);
  const totalMinor = amountMinor + (selected?.shippingFeeMinor ?? 0);
  const feeText = useMemo(() => "Payment processing is shown by the payment provider before confirmation.", []);

  const chooseReward = (id: number | null, minimum: number) => { setRewardId(id); setAmount((minimum / 100).toString()); };
  const createPledge = async () => {
    setLoading(true); setError("");
    try {
      const response = await browserApi<PledgeResponse>(`/api/v1/campaigns/${campaign.slug}/pledges`, {
        method: "POST",
        body: JSON.stringify({ amountMinor: totalMinor, rewardTierId: rewardId, isAnonymous: anonymous, shippingAddress: selected?.requiresShipping ? shipping : undefined }),
      });
      setPledge(response.data);
      if (response.data.checkoutUrl) window.location.assign(response.data.checkoutUrl);
    } catch (reason) {
      const apiError = reason as ApiError;
      setError(apiError.status === 401 ? "Sign in before backing a campaign." : apiError.message);
    } finally { setLoading(false); }
  };
  const completeSimulation = async () => {
    if (!pledge) return;
    setLoading(true); setError("");
    try {
      await browserApi(`/api/v1/pledges/${pledge.publicId}/simulate-payment`, { method: "POST", body: "{}" });
      setComplete(true);
    } catch (reason) { setError((reason as ApiError).message); } finally { setLoading(false); }
  };

  if (complete) return <div className="pledge-panel success-panel"><CheckCircle2 /><h2>Backing recorded</h2><p>Your local sandbox payment is complete. No real money moved.</p><Link href="/dashboard" className="button button-primary">View dashboard</Link></div>;

  return (
    <div className="pledge-panel">
      <span className="eyebrow">Back this campaign</span><h2>Choose your support</h2>
      {campaign.rewards?.length ? <div className="reward-picker">{campaign.rewards.map((reward) => <button key={reward.id} className={rewardId === reward.id ? "selected" : ""} onClick={() => chooseReward(reward.id, reward.amountMinor)}><span>{reward.title}</span><strong>{formatMoney(reward.amountMinor)}+</strong></button>)}<button className={rewardId === null ? "selected" : ""} onClick={() => chooseReward(null, campaign.minimumPledgeMinor)}><span>No reward</span><strong>{formatMoney(campaign.minimumPledgeMinor)}+</strong></button></div> : null}
      <label className="amount-field"><span>Backing amount</span><div><b>₱</b><input type="number" min={campaign.minimumPledgeMinor / 100} value={amount} onChange={(event) => setAmount(event.target.value)} /></div></label>
      {selected?.requiresShipping && <fieldset className="shipping-fields"><legend>Reward delivery</legend><input aria-label="Recipient name" placeholder="Recipient name" value={shipping.recipient} onChange={(event) => setShipping({ ...shipping, recipient: event.target.value })} /><input aria-label="Street address" placeholder="Street address" value={shipping.line1} onChange={(event) => setShipping({ ...shipping, line1: event.target.value })} /><div><input aria-label="City" placeholder="City" value={shipping.city} onChange={(event) => setShipping({ ...shipping, city: event.target.value })} /><input aria-label="Region" placeholder="Region" value={shipping.region} onChange={(event) => setShipping({ ...shipping, region: event.target.value })} /></div><input aria-label="Postal code" placeholder="Postal code" value={shipping.postalCode} onChange={(event) => setShipping({ ...shipping, postalCode: event.target.value })} /></fieldset>}
      {selected && selected.shippingFeeMinor > 0 && <div className="fee-line"><span>Nationwide shipping</span><strong>{formatMoney(selected.shippingFeeMinor)}</strong></div>}
      <div className="fee-line total-line"><span>Total</span><strong>{formatMoney(totalMinor)}</strong></div>
      <label className="check-label"><input type="checkbox" checked={anonymous} onChange={(event) => setAnonymous(event.target.checked)} /> Hide my name from the public backer list</label>
      <p className="payment-note"><LockKeyhole /> {feeText}</p>
      {error && <div className="form-error" role="alert">{error} {error.startsWith("Sign in") && <Link href="/signin">Sign in</Link>}</div>}
      {!pledge ? <button className="button button-primary button-block" disabled={loading || totalMinor < campaign.minimumPledgeMinor || Boolean(selected?.requiresShipping && Object.values(shipping).some((value) => !value.trim()))} onClick={createPledge}>{loading ? <LoaderCircle className="spin" /> : <>Continue securely <ChevronRight /></>}</button> : pledge.simulated ? <div className="sandbox-confirm"><strong>Sandbox checkout ready</strong><p>This development mode tests the full state transition without charging money.</p><button className="button button-primary button-block" disabled={loading} onClick={completeSimulation}>{loading ? <LoaderCircle className="spin" /> : "Complete sandbox payment"}</button></div> : null}
      <p className="pledge-disclaimer">Backing is not an investment and does not provide equity or guaranteed returns.</p>
    </div>
  );
}
