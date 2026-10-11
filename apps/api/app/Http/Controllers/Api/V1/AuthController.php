<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Support\Audit;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email:rfc', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:12', 'confirmed'],
            'role' => ['required', Rule::in(['founder', 'backer'])],
            'locale' => ['nullable', Rule::in(['en', 'fil'])],
            'inviteCode' => ['nullable', 'string', 'max:120'],
        ]);

        $requiredInvite = config('pitchpond.invite_code');
        if ($requiredInvite && ! hash_equals((string) $requiredInvite, (string) ($data['inviteCode'] ?? ''))) {
            throw ValidationException::withMessages(['inviteCode' => 'A valid closed-beta invite code is required.']);
        }

        $user = User::query()->create([
            'name' => $data['name'],
            'email' => mb_strtolower($data['email']),
            'password' => Hash::make($data['password']),
            'role' => $data['role'],
            'locale' => $data['locale'] ?? 'en',
        ]);

        Auth::login($user);
        if ($request->hasSession()) {
            $request->session()->regenerate();
        }
        $user->sendEmailVerificationNotification();
        Audit::record($request, 'auth.registered', $user, ['role' => $user->role]);

        return response()->json(['data' => $this->userData($user)], 201);
    }

    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
            'remember' => ['nullable', 'boolean'],
        ]);

        if (! Auth::attempt(['email' => $credentials['email'], 'password' => $credentials['password']], (bool) ($credentials['remember'] ?? false))) {
            throw ValidationException::withMessages(['email' => 'The provided credentials are incorrect.']);
        }

        if ($request->hasSession()) {
            $request->session()->regenerate();
        }
        Audit::record($request, 'auth.logged_in', $request->user());

        return response()->json(['data' => $this->userData($request->user())]);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json(['data' => $this->userData($request->user())]);
    }

    public function logout(Request $request): JsonResponse
    {
        Audit::record($request, 'auth.logged_out', $request->user());
        Auth::guard('web')->logout();
        if ($request->hasSession()) {
            $request->session()->invalidate();
            $request->session()->regenerateToken();
        }

        return response()->json(['message' => 'Signed out.']);
    }

    private function userData(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'locale' => $user->locale,
            'emailVerified' => $user->hasVerifiedEmail(),
            'phoneVerified' => $user->phone_verified_at !== null,
            'mfaEnabled' => $user->mfa_enabled_at !== null,
        ];
    }
}
