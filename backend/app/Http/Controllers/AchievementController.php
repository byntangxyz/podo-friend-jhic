<?php

namespace App\Http\Controllers;

use App\Http\Resources\UserAchievementResource;
use App\Models\UserAchievement;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AchievementController extends Controller
{
    /**
     * Retrieve all achievements unlocked by the authenticated user.
     */
    public function index(Request $request): JsonResponse
    {
        $achievements = UserAchievement::where('user_id', $request->user()->id)
            ->orderBy('unlocked_at', 'desc')
            ->get();

        return response()->json([
            'status' => 'success',
            'message' => 'Achievements retrieved successfully',
            'data' => UserAchievementResource::collection($achievements),
            'unlocked_codes' => $achievements->pluck('achievement_code')->all(),
        ], 200);
    }
}
