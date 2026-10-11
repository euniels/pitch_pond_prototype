<?php

namespace Tests\Unit;

use App\Services\Payments\PayMongoWebhookVerifier;
use Tests\TestCase;

class PayMongoWebhookVerifierTest extends TestCase
{
    public function test_it_accepts_a_current_valid_signature_and_rejects_tampering(): void
    {
        config()->set('pitchpond.paymongo.webhook_secret', 'test-signing-secret');
        $body = '{"data":{"id":"evt_1"}}';
        $timestamp = (string) time();
        $signature = hash_hmac('sha256', $timestamp.'.'.$body, 'test-signing-secret');
        $header = "t={$timestamp},te={$signature}";
        $verifier = app(PayMongoWebhookVerifier::class);

        $this->assertTrue($verifier->verify($body, $header));
        $this->assertFalse($verifier->verify($body.'x', $header));
    }
}
