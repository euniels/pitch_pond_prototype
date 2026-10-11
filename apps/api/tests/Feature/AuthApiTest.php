<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class AuthApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_registration_requires_the_configured_beta_invite_and_sends_verification(): void
    {
        Notification::fake();
        config()->set('pitchpond.invite_code', 'invite-me');
        $payload = [
            'name' => 'Beta Founder', 'email' => 'beta@example.test', 'password' => 'VeryStrongPassword!2026',
            'password_confirmation' => 'VeryStrongPassword!2026', 'role' => 'founder', 'locale' => 'fil',
        ];

        $this->postJson('/api/v1/auth/register', [...$payload, 'inviteCode' => 'wrong'])->assertUnprocessable();
        $this->postJson('/api/v1/auth/register', [...$payload, 'inviteCode' => 'invite-me'])
            ->assertCreated()
            ->assertJsonPath('data.role', 'founder');

        Notification::assertSentTo(User::query()->where('email', 'beta@example.test')->firstOrFail(), VerifyEmail::class);
    }

    public function test_protected_api_returns_json_unauthorized_instead_of_redirecting(): void
    {
        $this->getJson('/api/v1/dashboard')->assertUnauthorized();
    }
}
