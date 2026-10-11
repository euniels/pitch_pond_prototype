<?php

namespace App\Services\Payments;

use App\Contracts\PaymentGateway;
use App\Models\Pledge;
use App\ValueObjects\PaymentSession;

final class SimulatedPaymentGateway implements PaymentGateway
{
    public function createCheckout(Pledge $pledge): PaymentSession
    {
        abort_if(app()->isProduction(), 503, 'Simulated payments are disabled in production.');

        return new PaymentSession('simulated', 'sim_'.$pledge->public_id, null);
    }
}
