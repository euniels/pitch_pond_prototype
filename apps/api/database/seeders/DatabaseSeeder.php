<?php

namespace Database\Seeders;

use App\Enums\CampaignStatus;
use App\Enums\CampaignType;
use App\Enums\VerificationStatus;
use App\Models\Campaign;
use App\Models\Organization;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $password = Hash::make('PitchPondDemo!2026');
        User::query()->updateOrCreate(['email' => 'admin@pitchpond.local'], [
            'name' => 'PitchPond Reviewer', 'password' => $password, 'role' => 'admin', 'locale' => 'en', 'email_verified_at' => now(),
        ]);
        $founder = User::query()->updateOrCreate(['email' => 'founder@pitchpond.local'], [
            'name' => 'Maya Santos', 'password' => $password, 'role' => 'founder', 'locale' => 'en', 'email_verified_at' => now(),
        ]);
        User::query()->updateOrCreate(['email' => 'backer@pitchpond.local'], [
            'name' => 'Juan dela Cruz', 'password' => $password, 'role' => 'backer', 'locale' => 'fil', 'email_verified_at' => now(),
        ]);

        $organization = Organization::query()->updateOrCreate(['owner_id' => $founder->id], [
            'legal_name' => 'Bayan Makers Cooperative',
            'display_name' => 'Bayan Makers',
            'registration_type' => 'cda',
            'registration_number' => 'LOCAL-DEMO-ONLY',
            'region' => 'Cordillera Administrative Region',
            'city' => 'Baguio City',
            'verification_status' => VerificationStatus::Verified,
            'verification_provider_ref' => 'local-demo-verification',
        ]);

        $campaigns = [
            [
                'slug' => 'bayan-brew-community-roastery',
                'title' => 'Bayan Brew Community Roastery',
                'tagline' => 'Shared roasting equipment that helps Cordillera coffee growers sell finished products.',
                'type' => CampaignType::Reward,
                'category' => 'Food & Beverage',
                'region' => 'Cordillera Administrative Region',
                'city' => 'Baguio City',
                'story' => 'This local development fixture demonstrates how a verified cooperative can explain a concrete need, publish a realistic delivery plan, and give backers a useful reward. The proposed shared roastery would let member growers process and package more of their own harvest rather than selling only raw beans.',
                'use_of_funds' => 'Roaster and safety installation: 55%. Packaging equipment: 20%. Training and permits: 15%. Contingency: 10%.',
                'risks' => 'Equipment delivery may be delayed, harvest volumes vary by season, and reward delivery depends on the cooperative completing food-safety requirements.',
                'cover_image_url' => 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1400&q=80',
                'funding_goal_minor' => 75000000,
                'raised_minor' => 48750000,
                'backer_count' => 214,
                'minimum_pledge_minor' => 50000,
                'duration_days' => 35,
                'is_featured' => true,
                'rewards' => [
                    ['title' => 'Founding supporter', 'description' => 'Digital thank-you wall and quarterly progress updates.', 'amount_minor' => 50000, 'quantity_total' => null, 'shipping_fee_minor' => 0],
                    ['title' => 'Cordillera coffee set', 'description' => 'Two 250g bags from the first community roast.', 'amount_minor' => 180000, 'quantity_total' => 180, 'shipping_fee_minor' => 15000, 'requires_shipping' => true],
                ],
            ],
            [
                'slug' => 'solar-cold-storage-nueva-ecija',
                'title' => 'Solar Cold Storage for Nueva Ecija Growers',
                'tagline' => 'A cooperative-owned cold room to reduce post-harvest vegetable losses.',
                'type' => CampaignType::Donation,
                'category' => 'Agriculture',
                'region' => 'Central Luzon',
                'city' => 'Cabanatuan City',
                'story' => 'This development campaign shows a donation-first community project. Participating growers have mapped their weekly storage needs and identified a shared site close to existing transport routes. Updates and receipts would be posted against each published milestone.',
                'use_of_funds' => 'Solar array and batteries: 40%. Insulated cold room: 38%. Site preparation: 12%. Training, permits, and contingency: 10%.',
                'risks' => 'Construction and grid-connection schedules may change. Equipment costs can move before procurement, and farmer usage may ramp more slowly than forecast.',
                'cover_image_url' => 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1400&q=80',
                'funding_goal_minor' => 120000000,
                'raised_minor' => 39600000,
                'backer_count' => 128,
                'minimum_pledge_minor' => 50000,
                'duration_days' => 45,
                'is_featured' => true,
                'rewards' => [],
            ],
            [
                'slug' => 'weave-forward-ilocos',
                'title' => 'Weave Forward: Looms for Ilocos Artisans',
                'tagline' => 'Modern looms, safer workspaces, and direct online sales for weaving families.',
                'type' => CampaignType::Reward,
                'category' => 'Creative Industries',
                'region' => 'Ilocos Region',
                'city' => 'Vigan City',
                'story' => 'This local seed demonstrates a small-enterprise reward campaign with limited inventory. The participating workshop would replace damaged looms, improve lighting and ventilation, and publish maker profiles so buyers understand who created each reward.',
                'use_of_funds' => 'Six looms: 50%. Workspace safety improvements: 20%. Materials: 15%. Product photography, packaging, and contingency: 15%.',
                'risks' => 'Handmade rewards require variable production time. Material availability and nationwide courier conditions can affect delivery dates.',
                'cover_image_url' => 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=1400&q=80',
                'funding_goal_minor' => 50000000,
                'raised_minor' => 41000000,
                'backer_count' => 176,
                'minimum_pledge_minor' => 50000,
                'duration_days' => 28,
                'is_featured' => true,
                'rewards' => [
                    ['title' => 'Woven bookmark', 'description' => 'A handwoven bookmark with an artisan story card.', 'amount_minor' => 75000, 'quantity_total' => 250, 'shipping_fee_minor' => 8000, 'requires_shipping' => true],
                    ['title' => 'Inabel table runner', 'description' => 'One limited handwoven table runner with tracked nationwide delivery.', 'amount_minor' => 250000, 'quantity_total' => 70, 'shipping_fee_minor' => 18000, 'requires_shipping' => true],
                ],
            ],
        ];

        foreach ($campaigns as $fixture) {
            $rewards = $fixture['rewards'];
            unset($fixture['rewards']);
            $campaign = Campaign::query()->updateOrCreate(['slug' => $fixture['slug']], [
                ...$fixture,
                'organization_id' => $organization->id,
                'status' => CampaignStatus::Live,
                'starts_at' => now()->subDays(8),
                'ends_at' => now()->addDays($fixture['duration_days'] - 8),
                'readiness_checks' => [
                    ['key' => 'identity', 'label' => 'Founder and business verification', 'complete' => true],
                    ['key' => 'story', 'label' => 'Detailed campaign story', 'complete' => true],
                    ['key' => 'risks', 'label' => 'Plain-language risk disclosure', 'complete' => true],
                    ['key' => 'funds', 'label' => 'Specific use-of-funds plan', 'complete' => true],
                    ['key' => 'rewards', 'label' => 'Reward and fulfilment plan', 'complete' => true],
                ],
            ]);
            $campaign->rewards()->delete();
            foreach ($rewards as $reward) {
                $campaign->rewards()->create([
                    ...$reward,
                    'ships_nationwide' => true,
                    'estimated_delivery_at' => now()->addMonths(4)->toDateString(),
                ]);
            }
        }
    }
}
