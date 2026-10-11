<?php

use App\Http\Controllers\Api\V1\AdminCampaignReviewController;
use App\Http\Controllers\Api\V1\AdminPayoutController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\CampaignController;
use App\Http\Controllers\Api\V1\DashboardController;
use App\Http\Controllers\Api\V1\OrganizationController;
use App\Http\Controllers\Api\V1\PayMongoWebhookController;
use App\Http\Controllers\Api\V1\PledgeController;
use App\Http\Controllers\Api\V1\SubscriptionController;
use App\Http\Controllers\Api\V1\VerificationController;
use Illuminate\Foundation\Auth\EmailVerificationRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::get('/status', fn () => response()->json([
        'data' => [
            'service' => 'PitchPond API',
            'status' => 'ok',
            'equityEnabled' => false,
            'paymentMode' => config('pitchpond.payment_driver'),
        ],
    ]));

    Route::get('/campaigns', [CampaignController::class, 'index']);
    Route::get('/campaigns/{campaign}', [CampaignController::class, 'show']);
    Route::get('/plans', [SubscriptionController::class, 'plans']);
    Route::post('/auth/register', [AuthController::class, 'register'])->middleware('throttle:4,1');
    Route::post('/auth/login', [AuthController::class, 'login'])->middleware('throttle:6,1');
    Route::get('/email/verify/{id}/{hash}', function (EmailVerificationRequest $request) {
        $request->fulfill();

        return redirect(config('pitchpond.frontend_url').'/dashboard?verified=1');
    })->middleware(['auth:sanctum', 'signed', 'throttle:6,1'])->name('verification.verify');
    Route::post('/webhooks/paymongo', PayMongoWebhookController::class)->middleware('throttle:120,1');

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/auth/me', [AuthController::class, 'me']);
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::post('/email/verification-notification', function (Request $request) {
            if (! $request->user()->hasVerifiedEmail()) {
                $request->user()->sendEmailVerificationNotification();
            }

            return response()->json(['message' => 'If verification is pending, a new email has been sent.']);
        })->middleware('throttle:3,1');
        Route::get('/dashboard', DashboardController::class);
        Route::get('/organizations', [OrganizationController::class, 'index']);
        Route::post('/organizations', [OrganizationController::class, 'store']);
        Route::post('/campaigns', [CampaignController::class, 'store']);
        Route::post('/campaigns/{campaign}/submit', [CampaignController::class, 'submit']);
        Route::post('/campaigns/{campaign}/pledges', [PledgeController::class, 'store'])->middleware('throttle:20,1');
        Route::post('/pledges/{pledge}/simulate-payment', [PledgeController::class, 'completeSimulated'])->middleware('throttle:10,1');
        Route::post('/subscriptions', [SubscriptionController::class, 'store']);
        Route::post('/verifications/identity/start', [VerificationController::class, 'start'])->middleware('throttle:5,1');

        Route::prefix('admin')->middleware('role:admin,reviewer')->group(function () {
            Route::get('/campaign-reviews', [AdminCampaignReviewController::class, 'index']);
            Route::patch('/campaign-reviews/{campaign}', [AdminCampaignReviewController::class, 'update']);
            Route::get('/payouts', [AdminPayoutController::class, 'index'])->middleware('role:admin');
            Route::post('/payouts/{payout}/approve', [AdminPayoutController::class, 'approve'])->middleware('role:admin');
        });
    });
});
