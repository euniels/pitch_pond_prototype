<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RewardTier extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected function casts(): array
    {
        return ['estimated_delivery_at' => 'date', 'requires_shipping' => 'boolean', 'ships_nationwide' => 'boolean'];
    }

    public function campaign(): BelongsTo
    {
        return $this->belongsTo(Campaign::class);
    }
}
