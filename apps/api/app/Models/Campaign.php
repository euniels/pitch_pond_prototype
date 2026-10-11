<?php

namespace App\Models;

use App\Enums\CampaignStatus;
use App\Enums\CampaignType;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Campaign extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'type' => CampaignType::class,
            'status' => CampaignStatus::class,
            'starts_at' => 'datetime',
            'ends_at' => 'datetime',
            'funded_at' => 'datetime',
            'is_featured' => 'boolean',
            'readiness_checks' => 'array',
        ];
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    public function scopePubliclyVisible(Builder $query): Builder
    {
        return $query->whereIn('status', [CampaignStatus::Live, CampaignStatus::Funded, CampaignStatus::Fulfilling, CampaignStatus::Completed]);
    }

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    public function rewards(): HasMany
    {
        return $this->hasMany(RewardTier::class)->orderBy('amount_minor');
    }

    public function pledges(): HasMany
    {
        return $this->hasMany(Pledge::class);
    }

    public function updates(): HasMany
    {
        return $this->hasMany(CampaignUpdate::class)->latest('published_at');
    }
}
