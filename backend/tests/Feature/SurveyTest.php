<?php

namespace Tests\Feature;

use App\Models\DailySurvey;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SurveyTest extends TestCase
{
    use RefreshDatabase;

    public function test_unauthenticated_user_cannot_access_survey_endpoints(): void
    {
        $this->postJson('/api/surveys/mood', ['mood' => 'fokus'])->assertStatus(401);
        $this->getJson('/api/surveys/today')->assertStatus(401);
    }

    public function test_user_can_submit_mood_today(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/surveys/mood', [
                'mood' => 'fokus',
            ]);

        $response->assertStatus(201)
            ->assertJson([
                'status' => 'success',
                'message' => 'Mood recorded successfully',
                'data' => [
                    'user_id' => $user->id,
                    'mood' => 'fokus',
                ],
            ]);

        $this->assertDatabaseHas('daily_surveys', [
            'user_id' => $user->id,
            'mood' => 'fokus',
        ]);
    }

    public function test_user_updating_mood_on_same_day_updates_existing_record(): void
    {
        $user = User::factory()->create();

        // First submission
        $this->actingAs($user, 'sanctum')
            ->postJson('/api/surveys/mood', [
                'mood' => 'lelah',
            ])
            ->assertStatus(201);

        // Second submission on same day
        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/surveys/mood', [
                'mood' => 'bersemangat',
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'status' => 'success',
                'message' => 'Mood updated successfully',
                'data' => [
                    'user_id' => $user->id,
                    'mood' => 'bersemangat',
                ],
            ]);

        $this->assertDatabaseCount('daily_surveys', 1);
        $this->assertDatabaseHas('daily_surveys', [
            'user_id' => $user->id,
            'mood' => 'bersemangat',
        ]);
    }

    public function test_submit_mood_validation_errors(): void
    {
        $user = User::factory()->create();

        // Missing mood
        $this->actingAs($user, 'sanctum')
            ->postJson('/api/surveys/mood', [])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['mood']);

        // Mood exceeds max characters (50)
        $this->actingAs($user, 'sanctum')
            ->postJson('/api/surveys/mood', [
                'mood' => str_repeat('a', 51),
            ])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['mood']);
    }

    public function test_user_can_get_today_mood(): void
    {
        $user = User::factory()->create();

        DailySurvey::create([
            'user_id' => $user->id,
            'mood' => 'tenang',
        ]);

        $response = $this->actingAs($user, 'sanctum')
            ->getJson('/api/surveys/today');

        $response->assertStatus(200)
            ->assertJson([
                'status' => 'success',
                'message' => 'Today\'s mood retrieved successfully',
                'data' => [
                    'user_id' => $user->id,
                    'mood' => 'tenang',
                ],
            ]);
    }

    public function test_user_gets_null_data_when_no_survey_today(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user, 'sanctum')
            ->getJson('/api/surveys/today');

        $response->assertStatus(200)
            ->assertJson([
                'status' => 'success',
                'message' => 'No mood recorded for today',
                'data' => null,
            ]);
    }

    public function test_user_cannot_see_other_users_mood(): void
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();

        DailySurvey::create([
            'user_id' => $user1->id,
            'mood' => 'senang',
        ]);

        $response = $this->actingAs($user2, 'sanctum')
            ->getJson('/api/surveys/today');

        $response->assertStatus(200)
            ->assertJson([
                'status' => 'success',
                'data' => null,
            ]);
    }

    public function test_surveys_from_yesterday_do_not_count_as_today(): void
    {
        $user = User::factory()->create();

        $yesterdaySurvey = DailySurvey::create([
            'user_id' => $user->id,
            'mood' => 'cemas',
        ]);
        $yesterdaySurvey->created_at = Carbon::yesterday();
        $yesterdaySurvey->save();

        // GET /api/surveys/today should return null
        $this->actingAs($user, 'sanctum')
            ->getJson('/api/surveys/today')
            ->assertStatus(200)
            ->assertJson([
                'status' => 'success',
                'data' => null,
            ]);

        // POST /api/surveys/mood today should create a new record instead of updating yesterday's
        $this->actingAs($user, 'sanctum')
            ->postJson('/api/surveys/mood', ['mood' => 'fokus'])
            ->assertStatus(201);

        $this->assertDatabaseCount('daily_surveys', 2);
    }
}
