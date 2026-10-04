<?php

namespace App\Http\Controllers;

use App\Actions\CheckAndUnlockAchievementsAction;
use App\Actions\UpdateGamificationStatsAction;
use App\Http\Resources\GamificationStatResource;
use App\Http\Resources\PomodoroSessionResource;
use App\Models\PomodoroSession;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SessionController extends Controller
{
    /**
     * Start a new Pomodoro session.
     */
    public function start(Request $request): JsonResponse
    {
        $session = PomodoroSession::create([
            'user_id' => $request->user()->id,
            'start_time' => Carbon::now(),
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Pomodoro session started',
            'data' => new PomodoroSessionResource($session),
        ], 201);
    }

    /**
     * Complete an existing Pomodoro session.
     */
    public function complete(
        Request $request,
        string $id,
        UpdateGamificationStatsAction $gamificationAction,
        CheckAndUnlockAchievementsAction $achievementAction
    ): JsonResponse {
        $session = PomodoroSession::find($id);

        if (! $session) {
            return response()->json([
                'status' => 'error',
                'message' => 'Session not found',
                'data' => null,
            ], 404);
        }

        if ($session->user_id !== $request->user()->id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized access to this session',
                'data' => null,
            ], 403);
        }

        if ($session->end_time !== null) {
            return response()->json([
                'status' => 'error',
                'message' => 'Session is already completed',
                'data' => null,
            ], 400);
        }

        $startTime = Carbon::parse($session->start_time);
        $endTime = Carbon::now();
        $durationInSeconds = (int) $startTime->diffInSeconds($endTime);

        if ($durationInSeconds > 0) {
            $durationMinutes = (int) max(1, ceil($durationInSeconds / 60));
        } else {
            $durationMinutes = 0;
        }

        $session->update([
            'end_time' => $endTime,
            'duration_minutes' => $durationMinutes,
        ]);

        $stats = $gamificationAction->execute($request->user(), $durationMinutes);
        $newlyUnlocked = $achievementAction->execute($request->user(), $stats);

        return response()->json([
            'status' => 'success',
            'message' => 'Pomodoro session completed',
            'data' => [
                'session' => new PomodoroSessionResource($session),
                'gamification_stat' => new GamificationStatResource($stats),
            ],
            'meta' => [
                'newly_unlocked_achievements' => $newlyUnlocked,
            ],
        ], 200);
    }
}
