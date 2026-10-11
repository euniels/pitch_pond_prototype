<?php

namespace App\Services;

use App\Models\Campaign;
use App\Models\Subscription;

final class FeeCalculator
{
    public function successFeeBps(Campaign $campaign): int
    {
        $ownerId = $campaign->organization->owner_id;
        $isPro = Subscription::query()
            ->where('user_id', $ownerId)
            ->where('plan_code', 'founder_pro')
            ->where('status', 'active')
            ->where(fn ($query) => $query->whereNull('current_period_ends_at')->orWhere('current_period_ends_at', '>', now()))
            ->exists();

        return $isPro ? 300 : 500;
    }

    public function successFeeMinor(Campaign $campaign, int $amountMinor): int
    {
        return (int) round($amountMinor * $this->successFeeBps($campaign) / 10_000);
    }
}
