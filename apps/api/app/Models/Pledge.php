<?php

namespace App\Models;

use App\Enums\PledgeStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Pledge extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'status' => PledgeStatus::class,
            'is_anonymous' => 'boolean',
            'paid_at' => 'datetime',
            'refunded_at' => 'datetime',
            'reward_snapshot' => 'array',
            'shipping_address' => 'encrypted:array',
        ];
    }

    public function getRouteKeyName(): string
    {
        return 'public_id';
    }

    public function campaign(): BelongsTo
    {
        return $this->belongsTo(Campaign::class);
    }

    public function backer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'backer_id');
    }

    public function reward(): BelongsTo
    {
        return $this->belongsTo(RewardTier::class, 'reward_tier_id');
    }
}
