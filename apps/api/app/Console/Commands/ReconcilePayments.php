<?php

namespace App\Console\Commands;

use App\Models\Payment;
use Illuminate\Console\Command;

class ReconcilePayments extends Command
{
    protected $signature = 'payments:reconcile {--fail-on-stale}';

    protected $description = 'Report payment records requiring provider reconciliation';

    public function handle(): int
    {
        $stale = Payment::query()->where('status', 'pending')->where('created_at', '<', now()->subMinutes(20))->count();
        $failed = Payment::query()->where('status', 'failed')->where('updated_at', '>', now()->subDay())->count();
        $this->components->twoColumnDetail('Stale pending payments', (string) $stale);
        $this->components->twoColumnDetail('Failed in the past 24 hours', (string) $failed);

        if ($this->option('fail-on-stale') && $stale > 0) {
            $this->error('Payment reconciliation requires operator attention.');

            return self::FAILURE;
        }

        return self::SUCCESS;
    }
}
