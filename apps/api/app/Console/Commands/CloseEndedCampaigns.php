<?php

namespace App\Console\Commands;

use App\Enums\CampaignStatus;
use App\Enums\PledgeStatus;
use App\Models\Campaign;
use App\Models\Payout;
use App\Models\Pledge;
use App\Models\Refund;
use App\Services\FeeCalculator;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class CloseEndedCampaigns extends Command
{
    protected $signature = 'campaigns:close-ended';

    protected $description = 'Atomically close ended campaigns and queue unsuccessful backing for refund';

    public function handle(FeeCalculator $fees): int
    {
        $processed = 0;
        Campaign::query()
            ->where('status', CampaignStatus::Live)
            ->where('ends_at', '<=', now())
            ->pluck('id')
            ->each(function (int $campaignId) use (&$processed, $fees) {
                DB::transaction(function () use ($campaignId, &$processed, $fees) {
                    $campaign = Campaign::query()->lockForUpdate()->findOrFail($campaignId);
                    if ($campaign->status !== CampaignStatus::Live || $campaign->ends_at?->isFuture()) {
                        return;
                    }

                    if ($campaign->raised_minor >= $campaign->funding_goal_minor) {
                        $campaign->update(['status' => CampaignStatus::Funded, 'funded_at' => now()]);
                        $platformFee = $fees->successFeeMinor($campaign->load('organization'), $campaign->raised_minor);
                        $processingFee = (int) DB::table('pledges')
                            ->where('campaign_id', $campaign->id)
                            ->sum('processing_fee_minor');
                        Payout::query()->firstOrCreate(['campaign_id' => $campaign->id], [
                            'gross_amount_minor' => $campaign->raised_minor,
                            'platform_fee_minor' => $platformFee,
                            'processing_fee_minor' => $processingFee,
                            'net_amount_minor' => max(0, $campaign->raised_minor - $platformFee - $processingFee),
                            'status' => 'pending',
                        ]);
                    } else {
                        $campaign->update(['status' => CampaignStatus::Failed]);
                        Pledge::query()
                            ->where('campaign_id', $campaign->id)
                            ->where('status', PledgeStatus::Paid)
                            ->each(function (Pledge $pledge) {
                                $pledge->update(['status' => PledgeStatus::RefundPending]);
                                Refund::query()->firstOrCreate(
                                    ['pledge_id' => $pledge->id],
                                    ['amount_minor' => $pledge->amount_minor, 'reason' => 'campaign_goal_not_met', 'status' => 'pending'],
                                );
                            });
                    }
                    $processed++;
                });
            });

        $this->info("Processed {$processed} ended campaign(s).");

        return self::SUCCESS;
    }
}
