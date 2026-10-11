<?php

namespace Tests\Feature;

use App\Enums\CampaignStatus;
use App\Enums\PledgeStatus;
use App\Models\Campaign;
use App\Models\Pledge;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class CloseEndedCampaignsTest extends TestCase
{
    use RefreshDatabase;

    protected bool $seed = true;

    public function test_unsuccessful_campaign_queues_each_paid_pledge_for_refund(): void
    {
        $campaign = Campaign::query()->firstOrFail();
        $campaign->update(['status' => CampaignStatus::Live, 'ends_at' => now()->subMinute(), 'raised_minor' => 50000, 'funding_goal_minor' => 100000]);
        $pledge = Pledge::query()->create([
            'public_id' => (string) Str::uuid(), 'campaign_id' => $campaign->id,
            'backer_id' => User::query()->where('role', 'backer')->value('id'),
            'status' => PledgeStatus::Paid, 'amount_minor' => 50000,
        ]);

        $this->artisan('campaigns:close-ended')->assertSuccessful();

        $this->assertSame(CampaignStatus::Failed, $campaign->fresh()->status);
        $this->assertSame(PledgeStatus::RefundPending, $pledge->fresh()->status);
        $this->assertDatabaseHas('refunds', ['pledge_id' => $pledge->id, 'reason' => 'campaign_goal_not_met']);
    }

    public function test_successful_campaign_creates_a_pending_payout_with_basic_founder_fee(): void
    {
        $campaign = Campaign::query()->firstOrFail();
        $campaign->update([
            'status' => CampaignStatus::Live,
            'ends_at' => now()->subMinute(),
            'raised_minor' => 10_000_000,
            'funding_goal_minor' => 10_000_000,
        ]);

        $this->artisan('campaigns:close-ended')->assertSuccessful();

        $this->assertSame(CampaignStatus::Funded, $campaign->fresh()->status);
        $this->assertDatabaseHas('payouts', [
            'campaign_id' => $campaign->id,
            'gross_amount_minor' => 10_000_000,
            'platform_fee_minor' => 500_000,
            'net_amount_minor' => 9_500_000,
            'status' => 'pending',
        ]);
    }
}
