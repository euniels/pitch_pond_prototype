<?php

namespace App\Models;

use App\Enums\VerificationStatus;
use Illuminate\Database\Eloquent\Model;

class VerificationCase extends Model
{
    protected $guarded = [];

    protected function casts(): array
    {
        return ['status' => VerificationStatus::class, 'reviewed_at' => 'datetime'];
    }
}
