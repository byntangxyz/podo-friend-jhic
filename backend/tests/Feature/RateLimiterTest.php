<?php

namespace Tests\Feature;

use App\Models\ChatSession;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RateLimiterTest extends TestCase
{
    use RefreshDatabase;

    public function test_auth_rate_limiter_throttles_after_limit_exceeded(): void
    {
        // 10 requests allowed
        for ($i = 0; $i < 10; $i++) {
            $response = $this->postJson('/api/auth/login', [
                'email' => 'throttletest@example.com',
                'password' => 'wrongpassword',
            ]);
            $this->assertNotEquals(429, $response->status());
        }

        // 11th request must receive 429
        $throttledResponse = $this->postJson('/api/auth/login', [
            'email' => 'throttletest@example.com',
            'password' => 'wrongpassword',
        ]);

        $throttledResponse->assertStatus(429)
            ->assertJson([
                'status' => 'error',
                'message' => 'Terlalu banyak percobaan autentikasi. Silakan tunggu beberapa saat.',
                'data' => null,
            ])
            ->assertHeader('Retry-After');
    }

    public function test_ai_chat_rate_limiter_throttles_after_limit_exceeded(): void
    {
        $user = User::factory()->create();
        $session = ChatSession::create([
            'user_id' => $user->id,
            'title' => 'Test Session',
        ]);

        // 30 messages allowed per minute
        for ($i = 0; $i < 30; $i++) {
            $response = $this->actingAs($user)->postJson("/api/chat-sessions/{$session->id}/messages", [
                'sender' => 'user',
                'message' => 'Hello message ' . $i,
            ]);
            $this->assertEquals(201, $response->status());
        }

        // 31st message must be throttled
        $throttledResponse = $this->actingAs($user)->postJson("/api/chat-sessions/{$session->id}/messages", [
            'sender' => 'user',
            'message' => 'Spam message',
        ]);

        $throttledResponse->assertStatus(429)
            ->assertJson([
                'status' => 'error',
                'message' => 'Terlalu banyak pesan terkirim. Silakan tunggu beberapa saat.',
                'data' => null,
            ])
            ->assertHeader('Retry-After');
    }

    public function test_authenticated_api_general_rate_limiter_throttles_after_limit_exceeded(): void
    {
        $user = User::factory()->create();

        // 60 requests allowed per minute
        for ($i = 0; $i < 60; $i++) {
            $response = $this->actingAs($user)->getJson('/api/tasks');
            $this->assertEquals(200, $response->status());
        }

        // 61st request must be throttled
        $throttledResponse = $this->actingAs($user)->getJson('/api/tasks');

        $throttledResponse->assertStatus(429)
            ->assertJson([
                'status' => 'error',
                'message' => 'Batas permintaan tercapai. Silakan coba lagi nanti.',
                'data' => null,
            ])
            ->assertHeader('Retry-After');
    }
}
