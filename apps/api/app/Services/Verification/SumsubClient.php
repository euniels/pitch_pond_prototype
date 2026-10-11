<?php

namespace App\Services\Verification;

use Illuminate\Support\Facades\Http;

final class SumsubClient
{
    public function createAccessToken(string $externalUserId): array
    {
        $appToken = (string) config('pitchpond.sumsub.app_token');
        $secret = (string) config('pitchpond.sumsub.secret_key');
        abort_if($appToken === '' || $secret === '', 503, 'Sumsub is not configured.');

        $path = '/resources/accessTokens?userId='.rawurlencode($externalUserId)
            .'&levelName='.rawurlencode((string) config('pitchpond.sumsub.level_name'));
        $timestamp = (string) time();
        $signature = hash_hmac('sha256', $timestamp.'POST'.$path, $secret);

        return Http::withHeaders([
            'X-App-Token' => $appToken,
            'X-App-Access-Ts' => $timestamp,
            'X-App-Access-Sig' => $signature,
        ])->post(config('pitchpond.sumsub.api_url').$path)->throw()->json();
    }
}
