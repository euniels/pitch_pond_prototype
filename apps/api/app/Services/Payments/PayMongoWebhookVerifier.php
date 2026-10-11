<?php

namespace App\Services\Payments;

final class PayMongoWebhookVerifier
{
    public function verify(string $rawBody, ?string $header): bool
    {
        $secret = (string) config('pitchpond.paymongo.webhook_secret');
        if ($secret === '' || ! $header) {
            return false;
        }

        $parts = [];
        foreach (explode(',', $header) as $pair) {
            [$key, $value] = array_pad(explode('=', trim($pair), 2), 2, null);
            if ($key && $value) {
                $parts[$key] = $value;
            }
        }

        $timestamp = $parts['t'] ?? null;
        if (! $timestamp || abs(time() - (int) $timestamp) > 300) {
            return false;
        }

        $expected = hash_hmac('sha256', $timestamp.'.'.$rawBody, $secret);
        foreach (['te', 'li'] as $key) {
            if (isset($parts[$key]) && hash_equals($expected, $parts[$key])) {
                return true;
            }
        }

        return false;
    }
}
