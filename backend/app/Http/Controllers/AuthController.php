<?php

namespace App\Http\Controllers;

use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    /**
     * Register a new user.
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        $user = DB::transaction(function () use ($request) {
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
            ]);

            // Initialize default gamification stats and preferences
            $user->gamificationStat()->create([
                'current_streak' => 0,
                'total_focus_time' => 0,
                'last_active_date' => null,
            ]);

            $user->preference()->create([
                'chatbot_personality' => null,
            ]);

            return $user;
        });

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'status' => 'success',
            'message' => 'User registered successfully',
            'data' => [
                'user' => new UserResource($user->load(['preference', 'gamificationStat'])),
                'token' => $token,
            ],
        ], 201);
    }

    /**
     * Authenticate user and issue a token.
     */
    public function login(LoginRequest $request): JsonResponse
    {
        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json([
                'status' => 'error',
                'message' => 'Invalid email or password',
                'data' => null,
            ], 401);
        }

        /** @var \App\Models\User $user */
        $user = Auth::user();
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'status' => 'success',
            'message' => 'Login successful',
            'data' => [
                'user' => new UserResource($user->load(['preference', 'gamificationStat'])),
                'token' => $token,
            ],
        ], 200);
    }

    /**
     * Log out user and revoke current access token.
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Successfully logged out',
        ], 200);
    }
}
