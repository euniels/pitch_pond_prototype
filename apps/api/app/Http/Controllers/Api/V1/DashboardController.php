<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\CampaignStatus;
use App\Enums\PledgeStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\CampaignResource;
use App\Models\Campaign;
use App\Models\Pledge;
use App\Models\VerificationCase;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $user = $request->user();
        $base = ['user' => [
            'id' => $user->id, 'name' => $user->name, 'email' => $user->email,
            'role' => $user->role, 'locale' => $user->locale,
        ]];

        if ($user->role === 'founder') {
            $organizationIds = $user->organizations()->pluck('id');
            $campaigns = Campaign::query()->with(['organization', 'rewards'])
                ->whereIn('organization_id', $organizationIds)->latest()->get();

            return response()->json(['data' => $base + [
                'organizations' => $user->organizations,
                'campaigns' => CampaignResource::collection($campaigns)->resolve(),
                'totals' => [
                    'raisedMinor' => $campaigns->sum('raised_minor'),
                    'backers' => $campaigns->sum('backer_count'),
                    'activeCampaigns' => $campaigns->where('status', CampaignStatus::Live)->count(),
                ],
            ]]);
        }

        if (in_array($user->role, ['admin', 'reviewer'], true)) {
            return response()->json(['data' => $base + ['totals' => [
                'pendingCampaigns' => Campaign::query()->where('status', CampaignStatus::Submitted)->count(),
                'verificationCases' => VerificationCase::query()->whereIn('status', ['pending', 'needs_review'])->count(),
                'liveCampaigns' => Campaign::query()->where('status', CampaignStatus::Live)->count(),
            ]]]);
        }

        $pledges = Pledge::query()->with('campaign:id,slug,title,cover_image_url')->where('backer_id', $user->id)->latest()->get();

        return response()->json(['data' => $base + [
            'pledges' => $pledges->map(fn (Pledge $pledge) => [
                'publicId' => $pledge->public_id,
                'status' => $pledge->status->value,
                'amountMinor' => (int) $pledge->amount_minor,
                'createdAt' => $pledge->created_at->toIso8601String(),
                'campaign' => $pledge->campaign,
            ]),
            'totals' => [
                'backedMinor' => $pledges->where('status', PledgeStatus::Paid)->sum('amount_minor'),
                'campaignsBacked' => $pledges->where('status', PledgeStatus::Paid)->unique('campaign_id')->count(),
            ],
        ]]);
    }
}
