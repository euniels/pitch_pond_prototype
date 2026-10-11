<?php

namespace App\Enums;

enum VerificationStatus: string
{
    case NotStarted = 'not_started';
    case Pending = 'pending';
    case NeedsReview = 'needs_review';
    case Verified = 'verified';
    case Rejected = 'rejected';
}
