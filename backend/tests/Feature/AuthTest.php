<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_register_successfully(): void
    {
        $payload = [
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'password' => 'secret123',
            'password_confirmation' => 'secret123',
        ];

        $response = $this->postJson('/api/auth/register', $payload);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'status',
                'message',
                'data' => [
                    'user' => [
                        'id',
                        'name',
                        'email',
                        'preference',
                        'gamification_stat',
                    ],
                    'token',
                ],
            ]);

        $this->assertDatabaseHas('users', [
            'name' => 'John Doe',
            'email' => 'john@example.com',
        ]);

        $user = User::where('email', 'john@example.com')->first();
        $this->assertNotNull($user);

        $this->assertDatabaseHas('gamification_stats', [
            'user_id' => $user->id,
            'current_streak' => 0,
            'total_focus_time' => 0,
        ]);

        $this->assertDatabaseHas('user_preferences', [
            'user_id' => $user->id,
        ]);
    }

    public function test_registration_validation_errors(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'name' => '',
            'email' => 'invalid-email',
            'password' => 'short',
            'password_confirmation' => 'mismatch',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'email', 'password']);
    }

    public function test_user_cannot_register_with_existing_email(): void
    {
        User::factory()->create([
            'email' => 'existing@example.com',
        ]);

        $response = $this->postJson('/api/auth/register', [
            'name' => 'New User',
            'email' => 'existing@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    public function test_user_can_login_with_valid_credentials(): void
    {
        $user = User::factory()->create([
            'email' => 'jane@example.com',
            'password' => bcrypt('password123'),
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email' => 'jane@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'status' => 'success',
                'message' => 'Login successful',
            ])
            ->assertJsonStructure([
                'status',
                'message',
                'data' => [
                    'user' => ['id', 'name', 'email'],
                    'token',
                ],
            ]);
    }

    public function test_user_cannot_login_with_invalid_credentials(): void
    {
        User::factory()->create([
            'email' => 'jane@example.com',
            'password' => bcrypt('password123'),
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email' => 'jane@example.com',
            'password' => 'wrongpassword',
        ]);

        $response->assertStatus(401)
            ->assertJson([
                'status' => 'error',
                'message' => 'Invalid email or password',
            ]);
    }

    public function test_authenticated_user_can_logout(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('auth_token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson('/api/auth/logout');

        $response->assertStatus(200)
            ->assertJson([
                'status' => 'success',
                'message' => 'Successfully logged out',
            ]);

        $this->assertDatabaseMissing('personal_access_tokens', [
            'tokenable_id' => $user->id,
        ]);

        auth()->forgetGuards();

        // Attempting to access protected route with deleted token should fail
        $protectedResponse = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/user');

        $protectedResponse->assertStatus(401);
    }
}
