<?php

namespace App\Services\Payments;

use App\Contracts\PaymentGateway;
use App\Models\Pledge;
use App\ValueObjects\PaymentSession;
use Illuminate\Support\Facades\Http;

final class PayMongoPaymentGateway implements PaymentGateway
{
    public function createCheckout(Pledge $pledge): PaymentSession
    {
        $secret = (string) config('pitchpond.paymongo.secret_key');
        abort_if($secret === '', 503, 'PayMongo is not configured.');

        $campaign = $pledge->campaign;
        $response = Http::withBasicAuth($secret, '')
            ->acceptJson()
            ->post(config('pitchpond.paymongo.api_url').'/checkout_sessions', [
                'data' => [
                    'attributes' => [
                        'description' => 'PitchPond backing for '.$campaign->title,
                        'reference_number' => $pledge->public_id,
                        'line_items' => [[
                            'name' => $campaign->title,
                            'amount' => $pledge->amount_minor,
                            'currency' => 'PHP',
                            'quantity' => 1,
                        ]],
                        'payment_method_types' => ['card', 'gcash', 'paymaya', 'qrph'],
                        'success_url' => config('pitchpond.frontend_url').'/checkout/success?pledge='.$pledge->public_id,
                        'cancel_url' => config('pitchpond.frontend_url').'/campaigns/'.$campaign->slug.'?payment=cancelled',
                        'send_email_receipt' => true,
                        'metadata' => ['pledge_public_id' => $pledge->public_id],
                    ],
                ],
            ])->throw()->json('data');

        return new PaymentSession(
            'paymongo',
            (string) data_get($response, 'id'),
            data_get($response, 'attributes.checkout_url'),
        );
    }
}
