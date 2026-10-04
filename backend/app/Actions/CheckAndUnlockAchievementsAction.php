<?php

namespace App\Actions;

use App\Enums\AchievementCode;
use App\Models\GamificationStat;
use App\Models\User;
use App\Models\UserAchievement;
use Carbon\Carbon;

class CheckAndUnlockAchievementsAction
{
    /**
     * Evaluate achievement triggers following a completed Pomodoro session
     * and persist any newly unlocked achievements.
     *
     * @return list<string> Array of newly unlocked achievement codes
     */
    public function execute(User $user, GamificationStat $stats): array
    {
        $existingCodes = $user->achievements()->pluck('achievement_code')->all();
        $newlyUnlocked = [];

        // 1. FIRST_SESSION (Menyelesaikan sesi pertama)
        if (! in_array(AchievementCode::FIRST_SESSION, $existingCodes, true)) {
            $newlyUnlocked[] = AchievementCode::FIRST_SESSION;
        }

        // 2. FIRST_60_MIN (Total fokus mencapai 60 menit)
        if (! in_array(AchievementCode::FIRST_60_MIN, $existingCodes, true) && $stats->total_focus_time >= 60) {
            $newlyUnlocked[] = AchievementCode::FIRST_60_MIN;
        }

        // 3. STREAK_2_DAYS (Mencapai streak 2 hari)
        if (! in_array(AchievementCode::STREAK_2_DAYS, $existingCodes, true) && $stats->current_streak >= 2) {
            $newlyUnlocked[] = AchievementCode::STREAK_2_DAYS;
        }

        // 4. STREAK_3_DAYS (Mencapai streak 3 hari)
        if (! in_array(AchievementCode::STREAK_3_DAYS, $existingCodes, true) && $stats->current_streak >= 3) {
            $newlyUnlocked[] = AchievementCode::STREAK_3_DAYS;
        }

        // 5. STREAK_7_DAYS (Mencapai streak 7 hari)
        if (! in_array(AchievementCode::STREAK_7_DAYS, $existingCodes, true) && $stats->current_streak >= 7) {
            $newlyUnlocked[] = AchievementCode::STREAK_7_DAYS;
        }

        $now = Carbon::now();
        foreach ($newlyUnlocked as $code) {
            $user->achievements()->create([
                'achievement_code' => $code,
                'unlocked_at' => $now,
            ]);
        }

        return $newlyUnlocked;
    }
}
