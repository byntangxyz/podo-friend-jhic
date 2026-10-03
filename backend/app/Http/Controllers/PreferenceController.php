<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateUserPreferenceRequest;
use App\Http\Resources\UserPreferenceResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PreferenceController extends Controller
{
    /**
     * Get user preferences.
     */
    public function show(Request $request): JsonResponse
    {
        $user = $request->user();

        $preference = $user->preference ?? $user->preference()->create([
            'chatbot_personality' => null,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'User preferences retrieved successfully',
            'data' => new UserPreferenceResource($preference),
        ], 200);
    }

    /**
     * Update user preferences.
     */
    public function update(UpdateUserPreferenceRequest $request): JsonResponse
    {
        $user = $request->user();

        $preference = $user->preference()->updateOrCreate(
            ['user_id' => $user->id],
            ['chatbot_personality' => $request->validated('chatbot_personality')]
        );

        return response()->json([
            'status' => 'success',
            'message' => 'User preferences updated successfully',
            'data' => new UserPreferenceResource($preference),
        ], 200);
    }
}
