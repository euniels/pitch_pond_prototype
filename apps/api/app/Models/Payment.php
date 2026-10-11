<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    protected $guarded = [];

    protected function casts(): array
    {
        return ['provider_metadata' => 'encrypted:array'];
    }

    public function pledge(): BelongsTo
    {
        return $this->belongsTo(Pledge::class);
    }
}
