<?php

namespace App\ValueObjects;

final readonly class PaymentSession
{
    public function __construct(
        public string $provider,
        public string $reference,
        public ?string $checkoutUrl,
        public string $status = 'pending',
    ) {}
}
