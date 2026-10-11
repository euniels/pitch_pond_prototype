<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('role')->default('backer')->index();
            $table->string('locale', 5)->default('en');
            $table->string('phone', 32)->nullable()->unique();
            $table->timestamp('phone_verified_at')->nullable();
            $table->timestamp('mfa_enabled_at')->nullable();
        });

        Schema::create('organizations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('owner_id')->constrained('users')->cascadeOnDelete();
            $table->string('legal_name');
            $table->string('display_name');
            $table->string('registration_type')->nullable();
            $table->string('registration_number')->nullable();
            $table->string('region')->nullable();
            $table->string('city')->nullable();
            $table->string('verification_status')->default('not_started')->index();
            $table->string('verification_provider_ref')->nullable();
            $table->timestamps();
        });

        Schema::create('verification_cases', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('organization_id')->nullable()->constrained()->nullOnDelete();
            $table->string('kind');
            $table->string('provider')->default('sumsub');
            $table->string('provider_ref')->nullable()->unique();
            $table->string('status')->default('not_started')->index();
            $table->text('review_note')->nullable();
            $table->timestamp('reviewed_at')->nullable();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('payout_accounts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->string('provider')->default('paymongo');
            $table->string('provider_account_ref')->unique();
            $table->string('bank_name')->nullable();
            $table->string('account_last_four', 4)->nullable();
            $table->boolean('verified')->default(false);
            $table->timestamps();
        });

        Schema::create('campaigns', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->string('slug')->unique();
            $table->string('title');
            $table->string('tagline', 160);
            $table->string('type')->default('reward')->index();
            $table->string('status')->default('draft')->index();
            $table->string('category')->index();
            $table->string('region')->index();
            $table->string('city')->nullable();
            $table->longText('story');
            $table->text('use_of_funds');
            $table->text('risks');
            $table->string('cover_image_url')->nullable();
            $table->unsignedBigInteger('funding_goal_minor');
            $table->unsignedBigInteger('raised_minor')->default(0);
            $table->unsignedInteger('backer_count')->default(0);
            $table->unsignedBigInteger('minimum_pledge_minor')->default(50000);
            $table->unsignedSmallInteger('duration_days')->default(30);
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('ends_at')->nullable();
            $table->timestamp('funded_at')->nullable();
            $table->boolean('is_featured')->default(false);
            $table->json('readiness_checks')->nullable();
            $table->text('review_note')->nullable();
            $table->timestamps();
            $table->index(['status', 'ends_at']);
        });

        Schema::create('reward_tiers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('campaign_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->text('description');
            $table->unsignedBigInteger('amount_minor');
            $table->unsignedInteger('quantity_total')->nullable();
            $table->unsignedInteger('quantity_claimed')->default(0);
            $table->unsignedBigInteger('shipping_fee_minor')->default(0);
            $table->boolean('requires_shipping')->default(false);
            $table->boolean('ships_nationwide')->default(true);
            $table->date('estimated_delivery_at')->nullable();
            $table->timestamps();
        });

        Schema::create('pledges', function (Blueprint $table) {
            $table->id();
            $table->uuid('public_id')->unique();
            $table->foreignId('campaign_id')->constrained()->cascadeOnDelete();
            $table->foreignId('backer_id')->constrained('users')->restrictOnDelete();
            $table->foreignId('reward_tier_id')->nullable()->constrained()->nullOnDelete();
            $table->string('status')->default('created')->index();
            $table->unsignedBigInteger('amount_minor');
            $table->unsignedBigInteger('platform_fee_minor')->default(0);
            $table->unsignedBigInteger('processing_fee_minor')->default(0);
            $table->string('currency', 3)->default('PHP');
            $table->boolean('is_anonymous')->default(false);
            $table->json('reward_snapshot')->nullable();
            $table->text('shipping_address')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamp('refunded_at')->nullable();
            $table->timestamps();
        });

        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pledge_id')->constrained()->cascadeOnDelete();
            $table->string('provider')->default('paymongo');
            $table->string('provider_payment_ref')->nullable()->unique();
            $table->string('checkout_url')->nullable();
            $table->string('status')->default('pending')->index();
            $table->unsignedBigInteger('amount_minor');
            $table->json('provider_metadata')->nullable();
            $table->timestamps();
        });

        Schema::create('refunds', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pledge_id')->constrained()->cascadeOnDelete();
            $table->string('provider_ref')->nullable()->unique();
            $table->unsignedBigInteger('amount_minor');
            $table->string('reason');
            $table->string('status')->default('pending')->index();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('subscriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('plan_code')->index();
            $table->string('status')->default('active')->index();
            $table->string('provider')->default('paymongo');
            $table->string('provider_subscription_ref')->nullable()->unique();
            $table->unsignedInteger('monthly_price_minor');
            $table->unsignedInteger('success_fee_bps');
            $table->timestamp('current_period_ends_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->timestamps();
        });

        Schema::create('payouts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('campaign_id')->constrained()->restrictOnDelete();
            $table->unsignedBigInteger('gross_amount_minor');
            $table->unsignedBigInteger('platform_fee_minor');
            $table->unsignedBigInteger('processing_fee_minor');
            $table->unsignedBigInteger('net_amount_minor');
            $table->string('status')->default('pending')->index();
            $table->string('provider_ref')->nullable()->unique();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('second_approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('released_at')->nullable();
            $table->timestamps();
        });

        Schema::create('campaign_updates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('campaign_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->longText('body');
            $table->timestamp('published_at')->nullable();
            $table->timestamps();
        });

        Schema::create('comments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('campaign_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('parent_id')->nullable()->constrained('comments')->cascadeOnDelete();
            $table->text('body');
            $table->string('status')->default('visible')->index();
            $table->timestamps();
        });

        Schema::create('disputes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pledge_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('opened_by')->constrained('users')->restrictOnDelete();
            $table->string('kind');
            $table->string('status')->default('open')->index();
            $table->text('summary');
            $table->foreignId('assigned_to')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();
        });

        Schema::create('webhook_events', function (Blueprint $table) {
            $table->id();
            $table->string('provider');
            $table->string('event_id');
            $table->string('event_type')->index();
            $table->longText('payload');
            $table->unsignedInteger('attempts')->default(0);
            $table->timestamp('processed_at')->nullable();
            $table->text('last_error')->nullable();
            $table->timestamps();
            $table->unique(['provider', 'event_id']);
        });

        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('actor_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('action')->index();
            $table->string('subject_type');
            $table->string('subject_id');
            $table->string('ip_address', 45)->nullable();
            $table->json('metadata')->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->index(['subject_type', 'subject_id']);
        });
    }

    public function down(): void
    {
        foreach ([
            'audit_logs', 'webhook_events', 'disputes', 'comments', 'campaign_updates',
            'payouts', 'subscriptions', 'refunds', 'payments', 'pledges', 'reward_tiers',
            'campaigns', 'payout_accounts', 'verification_cases', 'organizations',
        ] as $table) {
            Schema::dropIfExists($table);
        }

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['role', 'locale', 'phone', 'phone_verified_at', 'mfa_enabled_at']);
        });
    }
};
