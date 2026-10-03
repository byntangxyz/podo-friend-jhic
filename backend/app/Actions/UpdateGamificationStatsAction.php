<?php

namespace App\Actions;

use App\Models\GamificationStat;
use App\Models\User;
use Carbon\Carbon;

class UpdateGamificationStatsAction
{
    /**
     * Update user's gamification stats following a completed pomodoro session.
     */
    public function execute(User $user, int $durationMinutes): GamificationStat
    {
        $stat = $user->gamificationStat()->firstOrCreate(
            ['user_id' => $user->id],
            [
                'current_streak' => 0,
                'total_focus_time' => 0,
                'last_active_date' => null,
            ]
        );

        $now = Carbon::now();
        $today = $now->copy()->startOfDay();

        if ($stat->last_active_date === null) {
            // First ever completed session
            $stat->current_streak = 1;
        } else {
            $lastDate = Carbon::parse($stat->last_active_date)->startOfDay();
            $diffDays = (int) $lastDate->diffInDays($today, false);

            if ($diffDays <= 0) {
                // Same day session: streak remains unchanged (ensure at least 1)
                $stat->current_streak = max(1, $stat->current_streak);
            } elseif ($diffDays === 1) {
                // Consecutive day: streak increments
                $stat->current_streak = max(1, $stat->current_streak + 1);
            } elseif ($diffDays === 2) {
                // Grace Day (1 day missed): streak is preserved
                $stat->current_streak = max(1, $stat->current_streak);
            } else {
                // Inactivity > 2 days (missed more than 1 day): streak resets to 1
                $stat->current_streak = 1;
            }
        }

        $stat->total_focus_time += max(0, $durationMinutes);
        $stat->last_active_date = $now;
        $stat->save();

        return $stat;
    }
}
