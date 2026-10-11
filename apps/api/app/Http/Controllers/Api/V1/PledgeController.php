<?php

namespace App\Http\Controllers\Api\V1;

use App\Contracts\PaymentGateway;
use App\Enums\CampaignStatus;
use App\Enums\PledgeStatus;
use App\Http\Controllers\Controller;
use App\Models\Campaign;
use App\Models\Payment;
use App\Models\Pledge;
use App\Models\RewardTier;
use App\Services\PledgePaymentService;
use App\Support\Audit;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PledgeController extends Controller
{
    public function store(Request $request, Campaign $campaign, PaymentGateway $gateway): JsonResponse
    {
        $data = $request->validate([
            'amountMinor' => ['required', 'integer', 'min:10000', 'max:500000000'],
            'rewardTierId' => ['nullable', 'integer'],
            'isAnonymous' => ['nullable', 'boolean'],
            'shippingAddress' => ['nullable', 'array'],
            'shippingAddress.recipient' => ['required_with:shippingAddress', 'string', 'max:120'],
            'shippingAddress.line1' => ['required_with:shippingAddress', 'string', 'max:180'],
            'shippingAddress.city' => ['required_with:shippingAddress', 'string', 'max:100'],
            'shippingAddress.region' => ['required_with:shippingAddress', 'string', 'max:100'],
            'shippingAddress.postalCode' => ['required_with:shippingAddress', 'string', 'max:12'],
        ]);

        $pledge = DB::transaction(function () use ($request, $campaign, $data) {
            $campaign = Campaign::query()->lockForUpdate()->findOrFail($campaign->id);
            abort_unless($campaign->status === CampaignStatus::Live, 409, 'This campaign is not accepting backing.');
            abort_if($campaign->ends_at === null || $campaign->ends_at->isPast(), 409, 'This campaign has ended.');
            abort_if($data['amountMinor'] < $campaign->minimum_pledge_minor, 422, 'The amount is below this campaign’s minimum backing.');

            $reward = null;
            if ($data['rewardTierId'] ?? null) {
                $reward = RewardTier::query()->where('campaign_id', $campaign->id)->lockForUpdate()->findOrFail($data['rewardTierId']);
                abort_if($data['amountMinor'] < $reward->amount_minor, 422, 'The amount is below the selected reward tier.');
                abort_if($reward->requires_shipping && empty($data['shippingAddress']), 422, 'A delivery address is required for this reward.');
                abort_if($reward->quantity_total !== null && $reward->quantity_claimed >= $reward->quantity_total, 409, 'This reward is sold out.');
                $reward->increment('quantity_claimed');
            }

            $pledge = Pledge::query()->create([
                'public_id' => (string) Str::uuid(),
                'campaign_id' => $campaign->id,
                'backer_id' => $request->user()->id,
                'reward_tier_id' => $reward?->id,
                'status' => PledgeStatus::AwaitingPayment,
                'amount_minor' => $data['amountMinor'],
                'is_anonymous' => $data['isAnonymous'] ?? false,
                'reward_snapshot' => $reward ? [
                    'title' => $reward->title,
                    'description' => $reward->description,
                    'amountMinor' => $reward->amount_minor,
                    'estimatedDeliveryAt' => $reward->estimated_delivery_at?->toDateString(),
                ] : null,
                'shipping_address' => $data['shippingAddress'] ?? null,
            ]);
            Audit::record($request, 'pledge.created', $pledge, ['campaign_id' => $campaign->id]);

            return $pledge;
        });

        try {
            $session = $gateway->createCheckout($pledge->load('campaign'));
            Payment::query()->create([
                'pledge_id' => $pledge->id,
                'provider' => $session->provider,
                'provider_payment_ref' => $session->reference,
                'checkout_url' => $session->checkoutUrl,
                'status' => $session->status,
                'amount_minor' => $pledge->amount_minor,
            ]);
        } catch (\Throwable $exception) {
            $pledge->update(['status' => PledgeStatus::Failed]);
            $pledge->reward?->decrement('quantity_claimed');
            throw $exception;
        }

        return response()->json(['data' => [
            'publicId' => $pledge->public_id,
            'status' => $pledge->status->value,
            'amountMinor' => (int) $pledge->amount_minor,
            'paymentProvider' => $session->provider,
            'checkoutUrl' => $session->checkoutUrl,
            'simulated' => $session->provider === 'simulated',
        ]], 201);
    }

    public function completeSimulated(Request $request, Pledge $pledge, PledgePaymentService $payments): JsonResponse
    {
        abort_if(app()->isProduction() || config('pitchpond.payment_driver') !== 'simulated', 404);
        abort_unless($pledge->backer_id === $request->user()->id, 403);

        $payments->markPaid($pledge);
        Audit::record($request, 'pledge.simulated_paid', $pledge);

        return response()->json(['data' => ['status' => 'paid', 'publicId' => $pledge->public_id]]);
    }
}
