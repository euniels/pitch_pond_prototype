<?php

namespace App\Services;

use App\Enums\PledgeStatus;
use App\Models\Campaign;
use App\Models\Payment;
use App\Models\Pledge;
use Illuminate\Support\Facades\DB;

final class PledgePaymentService
{
    public function markPaid(Pledge $pledge, ?string $providerReference = null): Pledge
    {
        return DB::transaction(function () use ($pledge, $providerReference) {
            $pledge = Pledge::query()->lockForUpdate()->findOrFail($pledge->id);
            if ($pledge->status === PledgeStatus::Paid) {
                return $pledge;
            }
            abort_unless($pledge->status === PledgeStatus::AwaitingPayment, 409, 'Pledge is not awaiting payment.');
            $campaign = Campaign::query()->lockForUpdate()->findOrFail($pledge->campaign_id);

            $pledge->update(['status' => PledgeStatus::Paid, 'paid_at' => now()]);
            Payment::query()->where('pledge_id', $pledge->id)->update(array_filter([
                'status' => 'paid',
                'provider_payment_ref' => $providerReference,
            ], fn ($value) => $value !== null));
            $campaign->increment('raised_minor', $pledge->amount_minor);
            $campaign->increment('backer_count');

            return $pledge->fresh();
        });
    }
}
