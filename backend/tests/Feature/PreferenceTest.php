<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\UserPreference;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PreferenceTest extends TestCase
{
    use RefreshDatabase;

    public function test_unauthenticated_user_cannot_access_preference_endpoints(): void
    {
        $this->getJson('/api/user/preferences')->assertStatus(401);
        $this->putJson('/api/user/preferences', ['chatbot_personality' => 'santai'])->assertStatus(401);
    }

    public function test_user_can_retrieve_preferences(): void
    {
        $user = User::factory()->create();

        UserPreference::create([
            'user_id' => $user->id,
            'chatbot_personality' => 'santai',
        ]);

        $response = $this->actingAs($user, 'sanctum')
            ->getJson('/api/user/preferences');

        $response->assertStatus(200)
            ->assertJson([
                'status' => 'success',
                'message' => 'User preferences retrieved successfully',
                'data' => [
                    'user_id' => $user->id,
                    'chatbot_personality' => 'santai',
                ],
            ]);
    }

    public function test_user_without_preexisting_preference_gets_default_null_personality(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user, 'sanctum')
            ->getJson('/api/user/preferences');

        $response->assertStatus(200)
            ->assertJson([
                'status' => 'success',
                'data' => [
                    'user_id' => $user->id,
                    'chatbot_personality' => null,
                ],
            ]);

        $this->assertDatabaseHas('user_preferences', [
            'user_id' => $user->id,
            'chatbot_personality' => null,
        ]);
    }

    public function test_user_can_update_preference(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user, 'sanctum')
            ->putJson('/api/user/preferences', [
                'chatbot_personality' => 'suportif',
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'status' => 'success',
                'message' => 'User preferences updated successfully',
                'data' => [
                    'user_id' => $user->id,
                    'chatbot_personality' => 'suportif',
                ],
            ]);

        $this->assertDatabaseHas('user_preferences', [
            'user_id' => $user->id,
            'chatbot_personality' => 'suportif',
        ]);
    }

    public function test_update_preference_validation_errors(): void
    {
        $user = User::factory()->create();

        // Missing field
        $this->actingAs($user, 'sanctum')
            ->putJson('/api/user/preferences', [])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['chatbot_personality']);

        // Exceeds max length
        $this->actingAs($user, 'sanctum')
            ->putJson('/api/user/preferences', [
                'chatbot_personality' => str_repeat('a', 51),
            ])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['chatbot_personality']);
    }

    public function test_preferences_are_isolated_per_user(): void
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();

        UserPreference::create([
            'user_id' => $user1->id,
            'chatbot_personality' => 'tegas',
        ]);

        UserPreference::create([
            'user_id' => $user2->id,
            'chatbot_personality' => 'santai',
        ]);

        $this->actingAs($user1, 'sanctum')
            ->putJson('/api/user/preferences', [
                'chatbot_personality' => 'humoris',
            ])
            ->assertStatus(200);

        // Verify user2 preference was not modified
        $this->assertDatabaseHas('user_preferences', [
            'user_id' => $user2->id,
            'chatbot_personality' => 'santai',
        ]);

        // Verify user1 preference was modified
        $this->assertDatabaseHas('user_preferences', [
            'user_id' => $user1->id,
            'chatbot_personality' => 'humoris',
        ]);
    }
}
