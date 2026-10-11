<?php

return [
    'invite_code' => env('PITCHPOND_INVITE_CODE'),
    'equity_enabled' => false,
    'payment_driver' => env('PAYMENT_DRIVER', 'simulated'),
    'frontend_url' => env('FRONTEND_URL', 'http://localhost:3000'),
    'plans' => [
        'founder_basic' => ['monthly_price_minor' => 0, 'success_fee_bps' => 500],
        'founder_pro' => ['monthly_price_minor' => 149900, 'success_fee_bps' => 300],
        'backer_plus' => ['monthly_price_minor' => 29900, 'success_fee_bps' => 0],
    ],
    'paymongo' => [
        'secret_key' => env('PAYMONGO_SECRET_KEY'),
        'webhook_secret' => env('PAYMONGO_WEBHOOK_SECRET'),
        'api_url' => env('PAYMONGO_API_URL', 'https://api.paymongo.com/v1'),
    ],
    'sumsub' => [
        'app_token' => env('SUMSUB_APP_TOKEN'),
        'secret_key' => env('SUMSUB_SECRET_KEY'),
        'level_name' => env('SUMSUB_LEVEL_NAME', 'pitchpond-founder-idv'),
        'api_url' => env('SUMSUB_API_URL', 'https://api.sumsub.com'),
    ],
];
