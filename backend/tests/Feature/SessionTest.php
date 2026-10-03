<?php

namespace Tests\Feature;

use App\Models\GamificationStat;
use App\Models\PomodoroSession;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SessionTest extends TestCase
{
    use RefreshDatabase;

    public function test_unauthenticated_user_cannot_access_session_endpoints(): void
    {
        $this->postJson('/api/sessions')->assertStatus(401);
        $this->putJson('/api/sessions/some-id')->assertStatus(401);
    }

    public function test_user_can_start_pomodoro_session(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/sessions');

        $response->assertStatus(201)
            ->assertJson([
                'status' => 'success',
                'message' => 'Pomodoro session started',
            ])
            ->assertJsonStructure([
                'status',
                'message',
                'data' => [
                    'id',
                    'user_id',
                    'start_time',
                    'end_time',
                    'duration_minutes',
                ],
            ]);

        $this->assertDatabaseHas('pomodoro_sessions', [
            'user_id' => $user->id,
            'end_time' => null,
            'duration_minutes' => null,
        ]);
    }

    public function test_user_can_complete_pomodoro_session(): void
    {
        $user = User::factory()->create();
        $startTime = Carbon::now()->subMinutes(25);

        $session = PomodoroSession::create([
            'user_id' => $user->id,
            'start_time' => $startTime,
        ]);

        $response = $this->actingAs($user, 'sanctum')
            ->putJson("/api/sessions/{$session->id}");

        $response->assertStatus(200)
            ->assertJson([
                'status' => 'success',
                'message' => 'Pomodoro session completed',
            ])
            ->assertJsonPath('data.session.duration_minutes', 25)
            ->assertJsonPath('data.gamification_stat.total_focus_time', 25)
            ->assertJsonPath('data.gamification_stat.current_streak', 1);

        $this->assertDatabaseHas('pomodoro_sessions', [
            'id' => $session->id,
            'duration_minutes' => 25,
        ]);

        $this->assertDatabaseHas('gamification_stats', [
            'user_id' => $user->id,
            'total_focus_time' => 25,
            'current_streak' => 1,
        ]);
    }

    public function test_user_cannot_complete_already_completed_session(): void
    {
        $user = User::factory()->create();
        $session = PomodoroSession::create([
            'user_id' => $user->id,
            'start_time' => Carbon::now()->subMinutes(50),
            'end_time' => Carbon::now()->subMinutes(25),
            'duration_minutes' => 25,
        ]);

        $response = $this->actingAs($user, 'sanctum')
            ->putJson("/api/sessions/{$session->id}");

        $response->assertStatus(400)
            ->assertJson([
                'status' => 'error',
                'message' => 'Session is already completed',
            ]);
    }

    public function test_user_cannot_complete_session_belonging_to_another_user(): void
    {
        $userA = User::factory()->create();
        $userB = User::factory()->create();

        $session = PomodoroSession::create([
            'user_id' => $userA->id,
            'start_time' => Carbon::now()->subMinutes(25),
        ]);

        $response = $this->actingAs($userB, 'sanctum')
            ->putJson("/api/sessions/{$session->id}");

        $response->assertStatus(403)
            ->assertJson([
                'status' => 'error',
                'message' => 'Unauthorized access to this session',
            ]);
    }

    public function test_user_cannot_complete_non_existent_session(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user, 'sanctum')
            ->putJson('/api/sessions/00000000-0000-0000-0000-000000000000');

        $response->assertStatus(404)
            ->assertJson([
                'status' => 'error',
                'message' => 'Session not found',
            ]);
    }

    public function test_streak_same_day_session_does_not_increment(): void
    {
        $user = User::factory()->create();
        GamificationStat::create([
            'user_id' => $user->id,
            'current_streak' => 3,
            'total_focus_time' => 100,
            'last_active_date' => Carbon::now()->subHours(2),
        ]);

        $session = PomodoroSession::create([
            'user_id' => $user->id,
            'start_time' => Carbon::now()->subMinutes(30),
        ]);

        $response = $this->actingAs($user, 'sanctum')
            ->putJson("/api/sessions/{$session->id}");

        $response->assertStatus(200)
            ->assertJsonPath('data.gamification_stat.current_streak', 3)
            ->assertJsonPath('data.gamification_stat.total_focus_time', 130);
    }

    public function test_streak_consecutive_day_increments(): void
    {
        $user = User::factory()->create();
        GamificationStat::create([
            'user_id' => $user->id,
            'current_streak' => 2,
            'total_focus_time' => 50,
            'last_active_date' => Carbon::now()->subDay(),
        ]);

        $session = PomodoroSession::create([
            'user_id' => $user->id,
            'start_time' => Carbon::now()->subMinutes(25),
        ]);

        $response = $this->actingAs($user, 'sanctum')
            ->putJson("/api/sessions/{$session->id}");

        $response->assertStatus(200)
            ->assertJsonPath('data.gamification_stat.current_streak', 3)
            ->assertJsonPath('data.gamification_stat.total_focus_time', 75);
    }

    public function test_streak_grace_day_tolerance(): void
    {
        $user = User::factory()->create();
        // Last active 2 days ago (missed 1 day: grace day)
        GamificationStat::create([
            'user_id' => $user->id,
            'current_streak' => 4,
            'total_focus_time' => 120,
            'last_active_date' => Carbon::now()->subDays(2),
        ]);

        $session = PomodoroSession::create([
            'user_id' => $user->id,
            'start_time' => Carbon::now()->subMinutes(20),
        ]);

        $response = $this->actingAs($user, 'sanctum')
            ->putJson("/api/sessions/{$session->id}");

        $response->assertStatus(200)
            ->assertJsonPath('data.gamification_stat.current_streak', 4)
            ->assertJsonPath('data.gamification_stat.total_focus_time', 140);
    }

    public function test_streak_resets_after_grace_period(): void
    {
        $user = User::factory()->create();
        // Last active 3 days ago (missed > 1 day: beyond grace day)
        GamificationStat::create([
            'user_id' => $user->id,
            'current_streak' => 7,
            'total_focus_time' => 300,
            'last_active_date' => Carbon::now()->subDays(3),
        ]);

        $session = PomodoroSession::create([
            'user_id' => $user->id,
            'start_time' => Carbon::now()->subMinutes(25),
        ]);

        $response = $this->actingAs($user, 'sanctum')
            ->putJson("/api/sessions/{$session->id}");

        $response->assertStatus(200)
            ->assertJsonPath('data.gamification_stat.current_streak', 1)
            ->assertJsonPath('data.gamification_stat.total_focus_time', 325);
    }
}
