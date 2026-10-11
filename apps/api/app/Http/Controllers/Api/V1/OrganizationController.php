<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Organization;
use App\Support\Audit;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class OrganizationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        return response()->json(['data' => $request->user()->organizations]);
    }

    public function store(Request $request): JsonResponse
    {
        abort_unless(in_array($request->user()->role, ['founder', 'admin'], true), 403);

        $data = $request->validate([
            'legalName' => ['required', 'string', 'max:180'],
            'displayName' => ['required', 'string', 'max:120'],
            'registrationType' => ['required', Rule::in(['dti', 'sec', 'cda', 'unregistered'])],
            'registrationNumber' => ['nullable', 'string', 'max:100'],
            'region' => ['required', 'string', 'max:100'],
            'city' => ['required', 'string', 'max:100'],
        ]);

        $organization = Organization::query()->create([
            'owner_id' => $request->user()->id,
            'legal_name' => $data['legalName'],
            'display_name' => $data['displayName'],
            'registration_type' => $data['registrationType'],
            'registration_number' => $data['registrationNumber'] ?? null,
            'region' => $data['region'],
            'city' => $data['city'],
        ]);
        Audit::record($request, 'organization.created', $organization);

        return response()->json(['data' => $organization], 201);
    }
}
