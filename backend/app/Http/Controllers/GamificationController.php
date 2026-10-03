<?php

namespace App\Http\Controllers;

use App\Http\Resources\GamificationStatResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GamificationController extends Controller
{
    /**
     * Get gamification stats for the authenticated user.
     */
    public function show(Request $request): JsonResponse
    {
        $user = $request->user();

        $stats = $user->gamificationStat ?? $user->gamificationStat()->create([
            'current_streak' => 0,
            'total_focus_time' => 0,
            'last_active_date' => null,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Gamification stats retrieved successfully',
            'data' => new GamificationStatResource($stats),
        ], 200);
    }
}
