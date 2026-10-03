<?php

namespace Tests\Feature;

use App\Models\ChatHistory;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ChatHistoryTest extends TestCase
{
    use RefreshDatabase;

    public function test_unauthenticated_user_cannot_access_chat_endpoints(): void
    {
        $this->postJson('/api/chat', ['sender' => 'user', 'message' => 'Halo'])->assertStatus(401);
        $this->getJson('/api/chat')->assertStatus(401);
    }

    public function test_user_can_store_user_message(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/chat', [
                'sender' => 'user',
                'message' => 'Halo Podo, saya ingin fokus sekarang.',
            ]);

        $response->assertStatus(201)
            ->assertJson([
                'status' => 'success',
                'message' => 'Chat message stored successfully',
                'data' => [
                    'user_id' => $user->id,
                    'sender' => 'user',
                    'message' => 'Halo Podo, saya ingin fokus sekarang.',
                ],
            ]);

        $this->assertDatabaseHas('chat_histories', [
            'user_id' => $user->id,
            'sender' => 'user',
            'message' => 'Halo Podo, saya ingin fokus sekarang.',
        ]);
    }

    public function test_user_can_store_ai_message(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/chat', [
                'sender' => 'ai',
                'message' => 'Tentu! Mari kita mulai sesi pomodoro pertama Anda.',
            ]);

        $response->assertStatus(201)
            ->assertJson([
                'status' => 'success',
                'message' => 'Chat message stored successfully',
                'data' => [
                    'user_id' => $user->id,
                    'sender' => 'ai',
                    'message' => 'Tentu! Mari kita mulai sesi pomodoro pertama Anda.',
                ],
            ]);

        $this->assertDatabaseHas('chat_histories', [
            'user_id' => $user->id,
            'sender' => 'ai',
            'message' => 'Tentu! Mari kita mulai sesi pomodoro pertama Anda.',
        ]);
    }

    public function test_store_chat_validation_errors(): void
    {
        $user = User::factory()->create();

        // Missing sender and message
        $this->actingAs($user, 'sanctum')
            ->postJson('/api/chat', [])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['sender', 'message']);

        // Invalid sender
        $this->actingAs($user, 'sanctum')
            ->postJson('/api/chat', [
                'sender' => 'system',
                'message' => 'Testing',
            ])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['sender']);
    }

    public function test_user_can_retrieve_chat_history_in_chronological_order(): void
    {
        $user = User::factory()->create();

        $msg1 = ChatHistory::create([
            'user_id' => $user->id,
            'sender' => 'user',
            'message' => 'Pesan 1',
        ]);
        $msg1->created_at = Carbon::now()->subMinutes(10);
        $msg1->save();

        $msg2 = ChatHistory::create([
            'user_id' => $user->id,
            'sender' => 'ai',
            'message' => 'Pesan 2',
        ]);
        $msg2->created_at = Carbon::now()->subMinutes(5);
        $msg2->save();

        $msg3 = ChatHistory::create([
            'user_id' => $user->id,
            'sender' => 'user',
            'message' => 'Pesan 3',
        ]);
        $msg3->created_at = Carbon::now()->subMinute();
        $msg3->save();

        $response = $this->actingAs($user, 'sanctum')
            ->getJson('/api/chat');

        $response->assertStatus(200)
            ->assertJson([
                'status' => 'success',
                'message' => 'Chat history retrieved successfully',
            ]);

        $data = $response->json('data');
        $this->assertCount(3, $data);
        $this->assertEquals('Pesan 1', $data[0]['message']);
        $this->assertEquals('Pesan 2', $data[1]['message']);
        $this->assertEquals('Pesan 3', $data[2]['message']);
    }

    public function test_chat_history_does_not_leak_other_user_messages(): void
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();

        ChatHistory::create([
            'user_id' => $user1->id,
            'sender' => 'user',
            'message' => 'Pesan rahasia user 1',
        ]);

        ChatHistory::create([
            'user_id' => $user2->id,
            'sender' => 'user',
            'message' => 'Pesan milik user 2',
        ]);

        $response = $this->actingAs($user1, 'sanctum')
            ->getJson('/api/chat');

        $data = $response->json('data');
        $this->assertCount(1, $data);
        $this->assertEquals('Pesan rahasia user 1', $data[0]['message']);
    }

    public function test_chat_history_respects_limit_and_returns_latest_chronologically(): void
    {
        $user = User::factory()->create();

        for ($i = 1; $i <= 10; $i++) {
            $msg = ChatHistory::create([
                'user_id' => $user->id,
                'sender' => 'user',
                'message' => "Message $i",
            ]);
            $msg->created_at = Carbon::now()->subMinutes(11 - $i);
            $msg->save();
        }

        $response = $this->actingAs($user, 'sanctum')
            ->getJson('/api/chat?limit=5');

        $data = $response->json('data');
        $this->assertCount(5, $data);

        // Should return the 5 latest messages (Message 6 to 10) in chronological order
        $this->assertEquals('Message 6', $data[0]['message']);
        $this->assertEquals('Message 7', $data[1]['message']);
        $this->assertEquals('Message 8', $data[2]['message']);
        $this->assertEquals('Message 9', $data[3]['message']);
        $this->assertEquals('Message 10', $data[4]['message']);
    }
}
