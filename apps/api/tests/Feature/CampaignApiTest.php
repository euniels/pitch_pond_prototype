<?php

namespace Tests\Feature;

use App\Models\Organization;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CampaignApiTest extends TestCase
{
    use RefreshDatabase;

    protected bool $seed = true;

    public function test_public_campaign_list_contains_only_enabled_beta_types(): void
    {
        $response = $this->getJson('/api/v1/campaigns');

        $response->assertOk()->assertJsonCount(3, 'data');
        $this->assertNotContains('investment', collect($response->json('data'))->pluck('type')->all());
    }

    public function test_campaign_detail_exposes_rewards_and_readiness_checks(): void
    {
        $this->getJson('/api/v1/campaigns/bayan-brew-community-roastery')
            ->assertOk()
            ->assertJsonPath('data.organization.verificationStatus', 'verified')
            ->assertJsonCount(2, 'data.rewards')
            ->assertJsonCount(5, 'data.readinessChecks');
    }

    public function test_founder_can_create_and_submit_a_reward_campaign_but_not_investment(): void
    {
        $founder = User::query()->where('email', 'founder@pitchpond.local')->firstOrFail();
        $organization = Organization::query()->where('owner_id', $founder->id)->firstOrFail();
        $payload = $this->campaignPayload($organization->id);

        $create = $this->actingAs($founder)->postJson('/api/v1/campaigns', $payload)->assertSuccessful();
        $slug = $create->json('data.slug');
        $this->actingAs($founder)->postJson('/api/v1/campaigns/'.$slug.'/submit')
            ->assertOk()
            ->assertJsonPath('data.status', 'submitted');

        $this->actingAs($founder)->postJson('/api/v1/campaigns', [...$payload, 'type' => 'investment'])
            ->assertUnprocessable();
    }

    public function test_unverified_founder_cannot_submit(): void
    {
        $founder = User::factory()->create(['role' => 'founder']);
        $organization = Organization::query()->create([
            'owner_id' => $founder->id,
            'legal_name' => 'Unverified Demo',
            'display_name' => 'Unverified Demo',
            'registration_type' => 'dti',
            'region' => 'Central Luzon',
            'city' => 'Angeles City',
        ]);
        $slug = $this->actingAs($founder)->postJson('/api/v1/campaigns', $this->campaignPayload($organization->id))->json('data.slug');

        $this->actingAs($founder)->postJson('/api/v1/campaigns/'.$slug.'/submit')->assertUnprocessable();
    }

    private function campaignPayload(int $organizationId): array
    {
        return [
            'organizationId' => $organizationId,
            'title' => 'Community Food Cart Expansion',
            'tagline' => 'A safer shared preparation kitchen for neighborhood food-cart owners.',
            'type' => 'reward',
            'category' => 'Food & Beverage',
            'region' => 'Central Luzon',
            'city' => 'San Fernando',
            'story' => str_repeat('The founders tested this service with local food-cart operators and documented the equipment and training that the shared kitchen needs. ', 3),
            'useOfFunds' => 'Equipment purchases receive 60%, permits and safety improvements receive 25%, and a documented contingency receives 15%.',
            'risks' => 'Permit processing, equipment delivery, and supplier prices can change the schedule. Backers receive a written update for every material delay.',
            'fundingGoalMinor' => 5000000,
            'minimumPledgeMinor' => 50000,
            'durationDays' => 30,
            'rewards' => [[
                'title' => 'Supporter meal voucher',
                'description' => 'One voucher redeemable after the shared kitchen opens.',
                'amountMinor' => 75000,
                'quantityTotal' => 100,
                'shipsNationwide' => false,
            ]],
        ];
    }
}
