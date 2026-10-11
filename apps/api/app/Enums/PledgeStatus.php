<?php

namespace App\Enums;

enum PledgeStatus: string
{
    case Created = 'created';
    case AwaitingPayment = 'awaiting_payment';
    case Paid = 'paid';
    case Failed = 'failed';
    case Cancelled = 'cancelled';
    case RefundPending = 'refund_pending';
    case Refunded = 'refunded';
    case Chargeback = 'chargeback';
    case Resolved = 'resolved';
}
