<?php

namespace Tests\Feature;

use App\Models\GamificationStat;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GamificationTest extends TestCase
{
    use RefreshDatabase;

    public function test_unauthenticated_user_cannot_access_gamification_stats(): void
    {
        $this->getJson('/api/gamification/stats')->assertStatus(401);
    }

    public function test_user_can_retrieve_gamification_stats(): void
    {
        $user = User::factory()->create();

        GamificationStat::create([
            'user_id' => $user->id,
            'current_streak' => 4,
            'total_focus_time' => 120,
            'last_active_date' => Carbon::now(),
        ]);

        $response = $this->actingAs($user, 'sanctum')
            ->getJson('/api/gamification/stats');

        $response->assertStatus(200)
            ->assertJson([
                'status' => 'success',
                'message' => 'Gamification stats retrieved successfully',
                'data' => [
                    'user_id' => $user->id,
                    'current_streak' => 4,
                    'total_focus_time' => 120,
                ],
            ])
            ->assertJsonStructure([
                'status',
                'message',
                'data' => [
                    'id',
                    'user_id',
                    'current_streak',
                    'total_focus_time',
                    'last_active_date',
                    'created_at',
                    'updated_at',
                ],
            ]);
    }

    public function test_user_without_preexisting_gamification_stat_gets_default_stat(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user, 'sanctum')
            ->getJson('/api/gamification/stats');

        $response->assertStatus(200)
            ->assertJson([
                'status' => 'success',
                'data' => [
                    'user_id' => $user->id,
                    'current_streak' => 0,
                    'total_focus_time' => 0,
                    'last_active_date' => null,
                ],
            ]);

        $this->assertDatabaseHas('gamification_stats', [
            'user_id' => $user->id,
            'current_streak' => 0,
            'total_focus_time' => 0,
        ]);
    }

    public function test_gamification_stats_are_isolated_per_user(): void
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();

        GamificationStat::create([
            'user_id' => $user1->id,
            'current_streak' => 10,
            'total_focus_time' => 500,
        ]);

        GamificationStat::create([
            'user_id' => $user2->id,
            'current_streak' => 2,
            'total_focus_time' => 50,
        ]);

        $response = $this->actingAs($user1, 'sanctum')
            ->getJson('/api/gamification/stats');

        $response->assertStatus(200)
            ->assertJson([
                'data' => [
                    'user_id' => $user1->id,
                    'current_streak' => 10,
                    'total_focus_time' => 500,
                ],
            ]);
    }
}
