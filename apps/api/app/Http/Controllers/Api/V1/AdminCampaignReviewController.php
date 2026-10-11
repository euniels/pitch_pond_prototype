<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\CampaignStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\CampaignResource;
use App\Models\Campaign;
use App\Support\Audit;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AdminCampaignReviewController extends Controller
{
    public function index()
    {
        return CampaignResource::collection(Campaign::query()
            ->with(['organization', 'rewards'])
            ->whereIn('status', [CampaignStatus::Submitted, CampaignStatus::NeedsChanges])
            ->oldest()
            ->paginate(25));
    }

    public function update(Request $request, Campaign $campaign): CampaignResource
    {
        $data = $request->validate([
            'decision' => ['required', Rule::in(['approve', 'needs_changes', 'suspend'])],
            'note' => ['nullable', 'string', 'max:3000'],
        ]);

        if ($data['decision'] === 'approve') {
            abort_unless($campaign->status === CampaignStatus::Submitted, 409);
            $campaign->update([
                'status' => CampaignStatus::Live,
                'starts_at' => now(),
                'ends_at' => now()->addDays($campaign->duration_days),
                'review_note' => $data['note'] ?? null,
            ]);
        } else {
            $campaign->update([
                'status' => $data['decision'] === 'suspend' ? CampaignStatus::Suspended : CampaignStatus::NeedsChanges,
                'review_note' => $data['note'] ?? null,
            ]);
        }

        Audit::record($request, 'campaign.reviewed', $campaign, ['decision' => $data['decision']]);

        return new CampaignResource($campaign->fresh()->load(['organization', 'rewards', 'updates']));
    }
}
