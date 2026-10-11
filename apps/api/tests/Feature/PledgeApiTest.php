<?php

namespace Tests\Feature;

use App\Models\Campaign;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PledgeApiTest extends TestCase
{
    use RefreshDatabase;

    protected bool $seed = true;

    public function test_simulated_backing_updates_totals_exactly_once(): void
    {
        config()->set('pitchpond.payment_driver', 'simulated');
        $backer = User::query()->where('email', 'backer@pitchpond.local')->firstOrFail();
        $campaign = Campaign::query()->where('slug', 'bayan-brew-community-roastery')->firstOrFail();
        $originalRaised = $campaign->raised_minor;
        $originalBackers = $campaign->backer_count;
        $reward = $campaign->rewards()->firstOrFail();

        $created = $this->actingAs($backer)->postJson('/api/v1/campaigns/'.$campaign->slug.'/pledges', [
            'amountMinor' => $reward->amount_minor,
            'rewardTierId' => $reward->id,
            'isAnonymous' => true,
            'shippingAddress' => [
                'recipient' => 'Juan dela Cruz', 'line1' => '123 Demo Street', 'city' => 'Quezon City',
                'region' => 'National Capital Region', 'postalCode' => '1100',
            ],
        ])->assertCreated()->assertJsonPath('data.simulated', true);

        $publicId = $created->json('data.publicId');
        $this->actingAs($backer)->postJson('/api/v1/pledges/'.$publicId.'/simulate-payment')->assertOk();
        $this->actingAs($backer)->postJson('/api/v1/pledges/'.$publicId.'/simulate-payment')->assertOk();

        $campaign->refresh();
        $this->assertSame($originalRaised + $reward->amount_minor, $campaign->raised_minor);
        $this->assertSame($originalBackers + 1, $campaign->backer_count);
    }

    public function test_physical_reward_requires_a_delivery_address(): void
    {
        $backer = User::query()->where('email', 'backer@pitchpond.local')->firstOrFail();
        $campaign = Campaign::query()->where('slug', 'bayan-brew-community-roastery')->firstOrFail();
        $reward = $campaign->rewards()->where('requires_shipping', true)->firstOrFail();

        $this->actingAs($backer)->postJson('/api/v1/campaigns/'.$campaign->slug.'/pledges', [
            'amountMinor' => $reward->amount_minor,
            'rewardTierId' => $reward->id,
        ])->assertUnprocessable();
    }
}
