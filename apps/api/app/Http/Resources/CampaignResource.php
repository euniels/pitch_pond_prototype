<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CampaignResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $goal = max(1, (int) $this->funding_goal_minor);

        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'title' => $this->title,
            'tagline' => $this->tagline,
            'type' => $this->type->value,
            'status' => $this->status->value,
            'category' => $this->category,
            'region' => $this->region,
            'city' => $this->city,
            'story' => $this->story,
            'useOfFunds' => $this->use_of_funds,
            'risks' => $this->risks,
            'coverImageUrl' => $this->cover_image_url,
            'fundingGoalMinor' => (int) $this->funding_goal_minor,
            'raisedMinor' => (int) $this->raised_minor,
            'minimumPledgeMinor' => (int) $this->minimum_pledge_minor,
            'durationDays' => (int) $this->duration_days,
            'backerCount' => (int) $this->backer_count,
            'fundedPercent' => min(100, (int) round($this->raised_minor / $goal * 100)),
            'startsAt' => $this->starts_at?->toIso8601String(),
            'endsAt' => $this->ends_at?->toIso8601String(),
            'daysLeft' => $this->ends_at ? (int) floor(max(0, now()->diffInDays($this->ends_at, false))) : null,
            'isFeatured' => (bool) $this->is_featured,
            'readinessChecks' => $this->readiness_checks ?? [],
            'organization' => [
                'displayName' => $this->organization->display_name,
                'verificationStatus' => $this->organization->verification_status->value,
                'region' => $this->organization->region,
            ],
            'rewards' => $this->whenLoaded('rewards', fn () => $this->rewards->map(fn ($reward) => [
                'id' => $reward->id,
                'title' => $reward->title,
                'description' => $reward->description,
                'amountMinor' => (int) $reward->amount_minor,
                'quantityTotal' => $reward->quantity_total,
                'quantityClaimed' => (int) $reward->quantity_claimed,
                'shippingFeeMinor' => (int) $reward->shipping_fee_minor,
                'requiresShipping' => (bool) $reward->requires_shipping,
                'shipsNationwide' => (bool) $reward->ships_nationwide,
                'estimatedDeliveryAt' => $reward->estimated_delivery_at?->toDateString(),
            ])),
            'updates' => $this->whenLoaded('updates', fn () => $this->updates->map(fn ($update) => [
                'id' => $update->id,
                'title' => $update->title,
                'body' => $update->body,
                'publishedAt' => $update->published_at?->toIso8601String(),
            ])),
        ];
    }
}
