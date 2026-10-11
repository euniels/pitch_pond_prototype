<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\CampaignStatus;
use App\Http\Controllers\Controller;
use App\Models\Payout;
use App\Support\Audit;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminPayoutController extends Controller
{
    public function index(): JsonResponse
    {
        $payouts = Payout::query()
            ->with('campaign:id,slug,title,status')
            ->whereIn('status', ['pending', 'first_approved', 'approved'])
            ->oldest()
            ->paginate(25);

        return response()->json(['data' => $payouts]);
    }

    public function approve(Request $request, Payout $payout): JsonResponse
    {
        $payout = DB::transaction(function () use ($request, $payout) {
            $payout = Payout::query()->lockForUpdate()->findOrFail($payout->id);
            abort_if($payout->status === 'released', 409, 'Payout was already released.');

            if (! $payout->approved_by) {
                $payout->update(['approved_by' => $request->user()->id, 'status' => 'first_approved']);
                $payout->campaign()->update(['status' => CampaignStatus::PayoutPending]);
            } else {
                abort_if($payout->approved_by === $request->user()->id, 422, 'A different authorized operator must provide the second approval.');
                $payout->update(['second_approved_by' => $request->user()->id, 'status' => 'approved']);
            }

            Audit::record($request, 'payout.approved', $payout, ['approval_stage' => $payout->second_approved_by ? 2 : 1]);

            return $payout;
        });

        return response()->json(['data' => $payout]);
    }
}
