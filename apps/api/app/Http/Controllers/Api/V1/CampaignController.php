<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\CampaignStatus;
use App\Enums\CampaignType;
use App\Enums\VerificationStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\CampaignResource;
use App\Models\Campaign;
use App\Models\Organization;
use App\Support\Audit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class CampaignController extends Controller
{
    public function index(Request $request)
    {
        $filters = $request->validate([
            'search' => ['nullable', 'string', 'max:100'],
            'category' => ['nullable', 'string', 'max:80'],
            'region' => ['nullable', 'string', 'max:100'],
            'type' => ['nullable', Rule::in(['donation', 'reward'])],
            'sort' => ['nullable', Rule::in(['ending_soon', 'newest', 'most_funded'])],
            'featured' => ['nullable', 'boolean'],
            'perPage' => ['nullable', 'integer', 'min:1', 'max:24'],
        ]);

        $query = Campaign::query()->with('organization')->publiclyVisible();
        $query->when($filters['search'] ?? null, fn ($q, $search) => $q->where(fn ($nested) => $nested
            ->where('title', 'like', '%'.$search.'%')
            ->orWhere('tagline', 'like', '%'.$search.'%')));
        $query->when($filters['category'] ?? null, fn ($q, $value) => $q->where('category', $value));
        $query->when($filters['region'] ?? null, fn ($q, $value) => $q->where('region', $value));
        $query->when($filters['type'] ?? null, fn ($q, $value) => $q->where('type', $value));
        $query->when($filters['featured'] ?? null, fn ($q) => $q->where('is_featured', true));

        match ($filters['sort'] ?? 'newest') {
            'ending_soon' => $query->orderBy('ends_at'),
            'most_funded' => $query->orderByDesc('raised_minor'),
            default => $query->latest('starts_at'),
        };

        return CampaignResource::collection($query->paginate($filters['perPage'] ?? 12));
    }

    public function show(Request $request, Campaign $campaign): CampaignResource
    {
        $ownerId = $campaign->organization()->value('owner_id');
        $mayViewPrivate = $request->user() && ($request->user()->id === $ownerId || in_array($request->user()->role, ['admin', 'reviewer'], true));
        abort_unless($mayViewPrivate || in_array($campaign->status, [CampaignStatus::Live, CampaignStatus::Funded, CampaignStatus::Fulfilling, CampaignStatus::Completed], true), 404);

        return new CampaignResource($campaign->fresh()->load(['organization', 'rewards', 'updates']));
    }

    public function store(Request $request): CampaignResource
    {
        abort_unless(in_array($request->user()->role, ['founder', 'admin'], true), 403);
        $data = $this->validatedCampaign($request);
        $organization = Organization::query()->whereKey($data['organizationId'])->where('owner_id', $request->user()->id)->firstOrFail();

        $campaign = DB::transaction(function () use ($data, $organization, $request) {
            $campaign = Campaign::query()->create([
                'organization_id' => $organization->id,
                'slug' => Str::slug($data['title']).'-'.Str::lower(Str::random(6)),
                'title' => $data['title'],
                'tagline' => $data['tagline'],
                'type' => $data['type'],
                'category' => $data['category'],
                'region' => $data['region'],
                'city' => $data['city'] ?? null,
                'story' => $data['story'],
                'use_of_funds' => $data['useOfFunds'],
                'risks' => $data['risks'],
                'cover_image_url' => $data['coverImageUrl'] ?? null,
                'funding_goal_minor' => $data['fundingGoalMinor'],
                'minimum_pledge_minor' => $data['minimumPledgeMinor'] ?? 50000,
                'duration_days' => $data['durationDays'],
                'readiness_checks' => $this->readinessChecks($data, $organization),
            ]);

            foreach ($data['rewards'] ?? [] as $reward) {
                $campaign->rewards()->create([
                    'title' => $reward['title'],
                    'description' => $reward['description'],
                    'amount_minor' => $reward['amountMinor'],
                    'quantity_total' => $reward['quantityTotal'] ?? null,
                    'shipping_fee_minor' => $reward['shippingFeeMinor'] ?? 0,
                    'requires_shipping' => $reward['requiresShipping'] ?? false,
                    'ships_nationwide' => $reward['shipsNationwide'] ?? true,
                    'estimated_delivery_at' => $reward['estimatedDeliveryAt'] ?? null,
                ]);
            }

            Audit::record($request, 'campaign.created', $campaign);

            return $campaign;
        });

        return new CampaignResource($campaign->fresh()->load(['organization', 'rewards', 'updates']));
    }

    public function submit(Request $request, Campaign $campaign): CampaignResource
    {
        abort_unless($request->user()->hasVerifiedEmail(), 422, 'Verify your email address before submitting a campaign.');
        abort_unless($campaign->organization()->value('owner_id') === $request->user()->id, 403);
        abort_unless(in_array($campaign->status, [CampaignStatus::Draft, CampaignStatus::NeedsChanges], true), 409, 'Campaign cannot be submitted from its current state.');
        abort_unless($campaign->organization->verification_status === VerificationStatus::Verified, 422, 'Founder and business verification must be complete.');
        abort_if($campaign->type === CampaignType::Reward && $campaign->rewards()->count() === 0, 422, 'Reward campaigns require at least one reward tier.');

        $campaign->update(['status' => CampaignStatus::Submitted, 'review_note' => null]);
        Audit::record($request, 'campaign.submitted', $campaign);

        return new CampaignResource($campaign->fresh()->load(['organization', 'rewards', 'updates']));
    }

    private function validatedCampaign(Request $request): array
    {
        return $request->validate([
            'organizationId' => ['required', 'integer', 'exists:organizations,id'],
            'title' => ['required', 'string', 'min:8', 'max:140'],
            'tagline' => ['required', 'string', 'min:12', 'max:160'],
            'type' => ['required', Rule::in(['donation', 'reward'])],
            'category' => ['required', 'string', 'max:80'],
            'region' => ['required', 'string', 'max:100'],
            'city' => ['nullable', 'string', 'max:100'],
            'story' => ['required', 'string', 'min:120', 'max:30000'],
            'useOfFunds' => ['required', 'string', 'min:40', 'max:5000'],
            'risks' => ['required', 'string', 'min:40', 'max:5000'],
            'coverImageUrl' => ['nullable', 'url:https', 'max:1000'],
            'fundingGoalMinor' => ['required', 'integer', 'min:500000', 'max:5000000000'],
            'minimumPledgeMinor' => ['nullable', 'integer', 'min:10000'],
            'durationDays' => ['required', 'integer', 'min:7', 'max:90'],
            'rewards' => ['nullable', 'array', 'max:12'],
            'rewards.*.title' => ['required', 'string', 'max:120'],
            'rewards.*.description' => ['required', 'string', 'max:1000'],
            'rewards.*.amountMinor' => ['required', 'integer', 'min:10000'],
            'rewards.*.quantityTotal' => ['nullable', 'integer', 'min:1', 'max:100000'],
            'rewards.*.shippingFeeMinor' => ['nullable', 'integer', 'min:0'],
            'rewards.*.requiresShipping' => ['nullable', 'boolean'],
            'rewards.*.shipsNationwide' => ['nullable', 'boolean'],
            'rewards.*.estimatedDeliveryAt' => ['nullable', 'date', 'after:today'],
        ]);
    }

    private function readinessChecks(array $data, Organization $organization): array
    {
        return [
            ['key' => 'identity', 'label' => 'Founder and business verification', 'complete' => $organization->verification_status === VerificationStatus::Verified],
            ['key' => 'story', 'label' => 'Detailed campaign story', 'complete' => mb_strlen($data['story']) >= 300],
            ['key' => 'risks', 'label' => 'Plain-language risk disclosure', 'complete' => mb_strlen($data['risks']) >= 80],
            ['key' => 'funds', 'label' => 'Specific use-of-funds plan', 'complete' => mb_strlen($data['useOfFunds']) >= 80],
            ['key' => 'rewards', 'label' => 'Reward and fulfilment plan', 'complete' => $data['type'] === 'donation' || count($data['rewards'] ?? []) > 0],
        ];
    }
}
