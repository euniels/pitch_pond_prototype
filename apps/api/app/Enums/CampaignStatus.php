<?php

namespace App\Enums;

enum CampaignStatus: string
{
    case Draft = 'draft';
    case Submitted = 'submitted';
    case NeedsChanges = 'needs_changes';
    case Approved = 'approved';
    case Live = 'live';
    case Funded = 'funded';
    case Failed = 'failed';
    case PayoutPending = 'payout_pending';
    case Paid = 'paid';
    case Fulfilling = 'fulfilling';
    case Completed = 'completed';
    case Suspended = 'suspended';
    case Cancelled = 'cancelled';
}
