<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Pledge;
use App\Models\WebhookEvent;
use App\Services\Payments\PayMongoWebhookVerifier;
use App\Services\PledgePaymentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PayMongoWebhookController extends Controller
{
    public function __invoke(Request $request, PayMongoWebhookVerifier $verifier, PledgePaymentService $payments): JsonResponse
    {
        $rawBody = $request->getContent();
        abort_unless($verifier->verify($rawBody, $request->header('Paymongo-Signature')), 401, 'Invalid webhook signature.');

        $payload = json_decode($rawBody, true, 512, JSON_THROW_ON_ERROR);
        $eventId = (string) data_get($payload, 'data.id');
        $eventType = (string) data_get($payload, 'data.attributes.type');
        abort_if($eventId === '' || $eventType === '', 422, 'Malformed webhook event.');

        $event = WebhookEvent::query()->firstOrCreate(
            ['provider' => 'paymongo', 'event_id' => $eventId],
            ['event_type' => $eventType, 'payload' => $payload],
        );
        if ($event->processed_at) {
            return response()->json(['received' => true, 'duplicate' => true]);
        }

        $event->increment('attempts');
        try {
            if (in_array($eventType, ['checkout_session.payment.paid', 'payment.paid'], true)) {
                $publicId = data_get($payload, 'data.attributes.data.attributes.metadata.pledge_public_id')
                    ?? data_get($payload, 'data.attributes.data.attributes.reference_number');
                $providerReference = data_get($payload, 'data.attributes.data.id');
                if ($publicId) {
                    $payments->markPaid(Pledge::query()->where('public_id', $publicId)->firstOrFail(), $providerReference);
                }
            }
            $event->update(['processed_at' => now(), 'last_error' => null]);
        } catch (\Throwable $exception) {
            $event->update(['last_error' => mb_substr($exception->getMessage(), 0, 2000)]);
            report($exception);
            throw $exception;
        }

        return response()->json(['received' => true]);
    }
}
