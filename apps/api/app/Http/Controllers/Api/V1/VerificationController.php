<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\VerificationStatus;
use App\Http\Controllers\Controller;
use App\Models\VerificationCase;
use App\Services\Verification\SumsubClient;
use App\Support\Audit;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VerificationController extends Controller
{
    public function start(Request $request, SumsubClient $sumsub): JsonResponse
    {
        abort_unless(in_array($request->user()->role, ['founder', 'admin'], true), 403);
        $externalId = 'pitchpond-user-'.$request->user()->id;
        $case = VerificationCase::query()->updateOrCreate(
            ['user_id' => $request->user()->id, 'kind' => 'identity'],
            ['provider' => 'sumsub', 'provider_ref' => $externalId, 'status' => VerificationStatus::Pending],
        );
        $token = $sumsub->createAccessToken($externalId);
        Audit::record($request, 'verification.started', $case, ['provider' => 'sumsub']);

        return response()->json(['data' => [
            'provider' => 'sumsub',
            'token' => data_get($token, 'token'),
            'expiresInSeconds' => data_get($token, 'expiresInSecs'),
            'externalUserId' => $externalId,
        ]]);
    }
}
