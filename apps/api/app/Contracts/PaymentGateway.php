<?php

namespace App\Contracts;

use App\Models\Pledge;
use App\ValueObjects\PaymentSession;

interface PaymentGateway
{
    public function createCheckout(Pledge $pledge): PaymentSession;
}
