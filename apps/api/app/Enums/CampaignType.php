<?php

namespace App\Enums;

enum CampaignType: string
{
    case Donation = 'donation';
    case Reward = 'reward';
    case Investment = 'investment';

    public function enabledForBeta(): bool
    {
        return $this !== self::Investment;
    }
}
