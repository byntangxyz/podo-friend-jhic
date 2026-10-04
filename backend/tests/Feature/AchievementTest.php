<?php

namespace Tests\Feature;

use App\Enums\AchievementCode;
use App\Models\GamificationStat;
use App\Models\PomodoroSession;
use App\Models\User;
use App\Models\UserAchievement;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AchievementTest extends TestCase
{
    use RefreshDatabase;

    protected function tearDown(): void
    {
        Carbon::setTestNow();
        parent::tearDown();
    }

    public function test_unauthenticated_user_cannot_access_achievements(): void
    {
        $this->getJson('/api/achievements')->assertStatus(401);
    }

    public function test_completing_first_session_unlocks_first_session_achievement(): void
    {
        $user = User::factory()->create();
        $now = Carbon::now();
        Carbon::setTestNow($now);

        $session = PomodoroSession::create([
            'user_id' => $user->id,
            'start_time' => $now->copy()->subMinutes(25),
        ]);

        $response = $this->actingAs($user, 'sanctum')
            ->putJson("/api/sessions/{$session->id}");

        $response->assertStatus(200)
            ->assertJsonPath('meta.newly_unlocked_achievements', [AchievementCode::FIRST_SESSION]);

        $this->assertDatabaseHas('user_achievements', [
            'user_id' => $user->id,
            'achievement_code' => AchievementCode::FIRST_SESSION,
        ]);
    }

    public function test_completing_session_with_60_min_total_unlocks_first_60_min(): void
    {
        $user = User::factory()->create();
        $now = Carbon::now();
        Carbon::setTestNow($now);

        // User already has FIRST_SESSION and 35 minutes
        UserAchievement::create([
            'user_id' => $user->id,
            'achievement_code' => AchievementCode::FIRST_SESSION,
            'unlocked_at' => $now->copy()->subHours(2),
        ]);

        GamificationStat::create([
            'user_id' => $user->id,
            'current_streak' => 1,
            'total_focus_time' => 35,
            'last_active_date' => $now->copy()->subHours(2),
        ]);

        // Complete 25 min session -> total reaches 60 min
        $session = PomodoroSession::create([
            'user_id' => $user->id,
            'start_time' => $now->copy()->subMinutes(25),
        ]);

        $response = $this->actingAs($user, 'sanctum')
            ->putJson("/api/sessions/{$session->id}");

        $response->assertStatus(200)
            ->assertJsonPath('meta.newly_unlocked_achievements', [AchievementCode::FIRST_60_MIN]);

        $this->assertDatabaseHas('user_achievements', [
            'user_id' => $user->id,
            'achievement_code' => AchievementCode::FIRST_60_MIN,
        ]);
    }

    public function test_completing_session_at_streak_2_unlocks_streak_2_days(): void
    {
        $user = User::factory()->create();
        $now = Carbon::now();
        Carbon::setTestNow($now);

        UserAchievement::create([
            'user_id' => $user->id,
            'achievement_code' => AchievementCode::FIRST_SESSION,
            'unlocked_at' => $now->copy()->subDay(),
        ]);

        // Streak 1 yesterday
        GamificationStat::create([
            'user_id' => $user->id,
            'current_streak' => 1,
            'total_focus_time' => 25,
            'last_active_date' => $now->copy()->subDay(),
        ]);

        // Complete session today -> streak becomes 2
        $session = PomodoroSession::create([
            'user_id' => $user->id,
            'start_time' => $now->copy()->subMinutes(25),
        ]);

        $response = $this->actingAs($user, 'sanctum')
            ->putJson("/api/sessions/{$session->id}");

        $response->assertStatus(200)
            ->assertJsonPath('meta.newly_unlocked_achievements', [AchievementCode::STREAK_2_DAYS]);

        $this->assertDatabaseHas('user_achievements', [
            'user_id' => $user->id,
            'achievement_code' => AchievementCode::STREAK_2_DAYS,
        ]);
    }

    public function test_already_unlocked_achievements_are_not_duplicated(): void
    {
        $user = User::factory()->create();
        $now = Carbon::now();
        Carbon::setTestNow($now);

        UserAchievement::create([
            'user_id' => $user->id,
            'achievement_code' => AchievementCode::FIRST_SESSION,
            'unlocked_at' => $now->copy()->subHours(2),
        ]);

        GamificationStat::create([
            'user_id' => $user->id,
            'current_streak' => 1,
            'total_focus_time' => 25,
            'last_active_date' => $now->copy()->subHours(2),
        ]);

        // Second session of 10 minutes (total 35 minutes, streak still 1)
        $session = PomodoroSession::create([
            'user_id' => $user->id,
            'start_time' => $now->copy()->subMinutes(10),
        ]);

        $response = $this->actingAs($user, 'sanctum')
            ->putJson("/api/sessions/{$session->id}");

        $response->assertStatus(200)
            ->assertJsonPath('meta.newly_unlocked_achievements', []);

        $this->assertDatabaseCount('user_achievements', 1);
    }

    public function test_get_achievements_returns_user_unlocked_achievements(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();

        UserAchievement::create([
            'user_id' => $otherUser->id,
            'achievement_code' => AchievementCode::FIRST_SESSION,
            'unlocked_at' => Carbon::now(),
        ]);

        UserAchievement::create([
            'user_id' => $user->id,
            'achievement_code' => AchievementCode::FIRST_SESSION,
            'unlocked_at' => Carbon::now()->subDay(),
        ]);

        UserAchievement::create([
            'user_id' => $user->id,
            'achievement_code' => AchievementCode::FIRST_60_MIN,
            'unlocked_at' => Carbon::now(),
        ]);

        $response = $this->actingAs($user, 'sanctum')
            ->getJson('/api/achievements');

        $response->assertStatus(200)
            ->assertJson([
                'status' => 'success',
                'message' => 'Achievements retrieved successfully',
            ])
            ->assertJsonCount(2, 'data')
            ->assertJsonCount(2, 'unlocked_codes');

        $this->assertContains(AchievementCode::FIRST_SESSION, $response->json('unlocked_codes'));
        $this->assertContains(AchievementCode::FIRST_60_MIN, $response->json('unlocked_codes'));
    }
}
