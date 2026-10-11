<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Subscription;
use App\Support\Audit;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class SubscriptionController extends Controller
{
    public function plans(): JsonResponse
    {
        return response()->json(['data' => config('pitchpond.plans')]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate(['planCode' => ['required', Rule::in(['founder_pro', 'backer_plus'])]]);
        abort_if(app()->isProduction() || config('pitchpond.payment_driver') !== 'simulated', 501, 'Live subscription checkout requires an approved PayMongo billing account.');
        abort_if($data['planCode'] === 'founder_pro' && $request->user()->role !== 'founder', 422, 'This plan is for founders.');

        $plan = config('pitchpond.plans.'.$data['planCode']);
        $subscription = Subscription::query()->updateOrCreate(
            ['user_id' => $request->user()->id, 'plan_code' => $data['planCode']],
            [
                'status' => 'active',
                'provider' => 'simulated',
                'provider_subscription_ref' => 'sim_'.$request->user()->id.'_'.$data['planCode'],
                'monthly_price_minor' => $plan['monthly_price_minor'],
                'success_fee_bps' => $plan['success_fee_bps'],
                'current_period_ends_at' => now()->addMonth(),
                'cancelled_at' => null,
            ],
        );
        Audit::record($request, 'subscription.simulated_started', $subscription);

        return response()->json(['data' => $subscription], 201);
    }
}
