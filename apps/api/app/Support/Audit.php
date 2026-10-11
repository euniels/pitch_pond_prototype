<?php

namespace App\Support;

use App\Models\AuditLog;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;

final class Audit
{
    public static function record(Request $request, string $action, Model $subject, array $metadata = []): void
    {
        AuditLog::query()->create([
            'actor_id' => $request->user()?->id,
            'action' => $action,
            'subject_type' => $subject::class,
            'subject_id' => (string) $subject->getKey(),
            'ip_address' => $request->ip(),
            'metadata' => $metadata,
        ]);
    }
}
