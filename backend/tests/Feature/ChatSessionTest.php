<?php

namespace Tests\Feature;

use App\Models\ChatHistory;
use App\Models\ChatSession;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class ChatSessionTest extends TestCase
{
    use RefreshDatabase;

    public function test_unauthenticated_user_cannot_access_chat_sessions_and_messages(): void
    {
        $fakeUuid = (string) Str::uuid();

        $this->getJson('/api/chat-sessions')->assertStatus(401);
        $this->postJson('/api/chat-sessions')->assertStatus(401);
        $this->getJson("/api/chat-sessions/{$fakeUuid}")->assertStatus(401);
        $this->deleteJson("/api/chat-sessions/{$fakeUuid}")->assertStatus(401);
        $this->getJson("/api/chat-sessions/{$fakeUuid}/messages")->assertStatus(401);
        $this->postJson("/api/chat-sessions/{$fakeUuid}/messages", [
            'sender' => 'user',
            'message' => 'Halo',
        ])->assertStatus(401);
    }

    public function test_user_can_create_chat_session_without_title(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/chat-sessions');

        $response->assertStatus(201)
            ->assertJson([
                'status' => 'success',
                'message' => 'Chat session created successfully',
                'data' => [
                    'user_id' => $user->id,
                    'title' => null,
                ],
            ]);

        $this->assertDatabaseHas('chat_sessions', [
            'user_id' => $user->id,
            'title' => null,
        ]);
    }

    public function test_user_can_create_chat_session_with_title(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/chat-sessions', [
                'title' => 'Sesi Konsultasi Fokus Pagi',
            ]);

        $response->assertStatus(201)
            ->assertJson([
                'status' => 'success',
                'message' => 'Chat session created successfully',
                'data' => [
                    'user_id' => $user->id,
                    'title' => 'Sesi Konsultasi Fokus Pagi',
                ],
            ]);

        $this->assertDatabaseHas('chat_sessions', [
            'user_id' => $user->id,
            'title' => 'Sesi Konsultasi Fokus Pagi',
        ]);
    }

    public function test_user_can_list_their_chat_sessions_ordered_by_latest(): void
    {
        $user = User::factory()->create();

        $session1 = ChatSession::create([
            'user_id' => $user->id,
            'title' => 'Sesi Pertama',
        ]);
        $session1->created_at = Carbon::now()->subMinutes(10);
        $session1->save();

        $session2 = ChatSession::create([
            'user_id' => $user->id,
            'title' => 'Sesi Kedua',
        ]);
        $session2->created_at = Carbon::now()->subMinutes(5);
        $session2->save();

        $session3 = ChatSession::create([
            'user_id' => $user->id,
            'title' => 'Sesi Ketiga',
        ]);
        $session3->created_at = Carbon::now();
        $session3->save();

        $response = $this->actingAs($user, 'sanctum')
            ->getJson('/api/chat-sessions');

        $response->assertStatus(200)
            ->assertJson([
                'status' => 'success',
                'message' => 'Chat sessions retrieved successfully',
            ]);

        $data = $response->json('data');
        $this->assertCount(3, $data);
        // Order should be descending (latest first)
        $this->assertEquals($session3->id, $data[0]['id']);
        $this->assertEquals($session2->id, $data[1]['id']);
        $this->assertEquals($session1->id, $data[2]['id']);
    }

    public function test_user_cannot_see_other_users_chat_sessions(): void
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();

        ChatSession::create([
            'user_id' => $user1->id,
            'title' => 'Sesi User 1',
        ]);

        ChatSession::create([
            'user_id' => $user2->id,
            'title' => 'Sesi User 2',
        ]);

        $response = $this->actingAs($user1, 'sanctum')
            ->getJson('/api/chat-sessions');

        $data = $response->json('data');
        $this->assertCount(1, $data);
        $this->assertEquals('Sesi User 1', $data[0]['title']);
    }

    public function test_user_can_view_single_chat_session(): void
    {
        $user = User::factory()->create();
        $session = ChatSession::create([
            'user_id' => $user->id,
            'title' => 'Detail Sesi',
        ]);

        $response = $this->actingAs($user, 'sanctum')
            ->getJson("/api/chat-sessions/{$session->id}");

        $response->assertStatus(200)
            ->assertJson([
                'status' => 'success',
                'data' => [
                    'id' => $session->id,
                    'title' => 'Detail Sesi',
                ],
            ]);
    }

    public function test_user_cannot_view_another_users_chat_session(): void
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();

        $session2 = ChatSession::create([
            'user_id' => $user2->id,
            'title' => 'Sesi Rahasia User 2',
        ]);

        $this->actingAs($user1, 'sanctum')
            ->getJson("/api/chat-sessions/{$session2->id}")
            ->assertStatus(403);
    }

    public function test_user_can_store_user_and_ai_messages_in_session(): void
    {
        $user = User::factory()->create();
        $session = ChatSession::create([
            'user_id' => $user->id,
            'title' => 'Sesi Percakapan',
        ]);

        // Store user message
        $response1 = $this->actingAs($user, 'sanctum')
            ->postJson("/api/chat-sessions/{$session->id}/messages", [
                'sender' => 'user',
                'message' => 'Halo Podo, saya ingin memulai kerja.',
            ]);

        $response1->assertStatus(201)
            ->assertJson([
                'status' => 'success',
                'message' => 'Chat message stored successfully',
                'data' => [
                    'chat_session_id' => $session->id,
                    'user_id' => $user->id,
                    'sender' => 'user',
                    'message' => 'Halo Podo, saya ingin memulai kerja.',
                ],
            ]);

        // Store AI message
        $response2 = $this->actingAs($user, 'sanctum')
            ->postJson("/api/chat-sessions/{$session->id}/messages", [
                'sender' => 'ai',
                'message' => 'Halo! Semangat untuk sesi fokus Anda hari ini.',
            ]);

        $response2->assertStatus(201)
            ->assertJson([
                'status' => 'success',
                'message' => 'Chat message stored successfully',
                'data' => [
                    'chat_session_id' => $session->id,
                    'user_id' => $user->id,
                    'sender' => 'ai',
                    'message' => 'Halo! Semangat untuk sesi fokus Anda hari ini.',
                ],
            ]);

        $this->assertDatabaseCount('chat_histories', 2);
    }

    public function test_store_message_validation_errors(): void
    {
        $user = User::factory()->create();
        $session = ChatSession::create([
            'user_id' => $user->id,
            'title' => 'Sesi Uji Validasi',
        ]);

        // Missing fields
        $this->actingAs($user, 'sanctum')
            ->postJson("/api/chat-sessions/{$session->id}/messages", [])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['sender', 'message']);

        // Invalid sender
        $this->actingAs($user, 'sanctum')
            ->postJson("/api/chat-sessions/{$session->id}/messages", [
                'sender' => 'admin',
                'message' => 'Test',
            ])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['sender']);
    }

    public function test_user_cannot_store_message_in_another_users_session(): void
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();

        $session2 = ChatSession::create([
            'user_id' => $user2->id,
            'title' => 'Sesi Milik User 2',
        ]);

        $response = $this->actingAs($user1, 'sanctum')
            ->postJson("/api/chat-sessions/{$session2->id}/messages", [
                'sender' => 'user',
                'message' => 'Menyusup ke sesi orang lain',
            ]);

        $response->assertStatus(403);
    }

    public function test_user_cannot_store_message_in_nonexistent_session(): void
    {
        $user = User::factory()->create();
        $nonExistentId = (string) Str::uuid();

        $response = $this->actingAs($user, 'sanctum')
            ->postJson("/api/chat-sessions/{$nonExistentId}/messages", [
                'sender' => 'user',
                'message' => 'Pesan ke sesi gaib',
            ]);

        $response->assertStatus(404);
    }

    public function test_user_can_retrieve_messages_in_chronological_order_ascending(): void
    {
        $user = User::factory()->create();
        $session = ChatSession::create([
            'user_id' => $user->id,
            'title' => 'Sesi Riwayat Urutan',
        ]);

        $msg1 = ChatHistory::create([
            'chat_session_id' => $session->id,
            'user_id' => $user->id,
            'sender' => 'user',
            'message' => 'Pesan Pertama (Terlama)',
        ]);
        $msg1->created_at = Carbon::now()->subMinutes(15);
        $msg1->save();

        $msg2 = ChatHistory::create([
            'chat_session_id' => $session->id,
            'user_id' => $user->id,
            'sender' => 'ai',
            'message' => 'Pesan Kedua (Tengah)',
        ]);
        $msg2->created_at = Carbon::now()->subMinutes(10);
        $msg2->save();

        $msg3 = ChatHistory::create([
            'chat_session_id' => $session->id,
            'user_id' => $user->id,
            'sender' => 'user',
            'message' => 'Pesan Ketiga (Terbaru)',
        ]);
        $msg3->created_at = Carbon::now()->subMinutes(5);
        $msg3->save();

        $response = $this->actingAs($user, 'sanctum')
            ->getJson("/api/chat-sessions/{$session->id}/messages");

        $response->assertStatus(200)
            ->assertJson([
                'status' => 'success',
                'message' => 'Chat messages retrieved successfully',
            ]);

        $data = $response->json('data');
        $this->assertCount(3, $data);
        // Requirement: Order MUST be ascending (oldest to newest)
        $this->assertEquals('Pesan Pertama (Terlama)', $data[0]['message']);
        $this->assertEquals('Pesan Kedua (Tengah)', $data[1]['message']);
        $this->assertEquals('Pesan Ketiga (Terbaru)', $data[2]['message']);
    }

    public function test_messages_respect_limit_parameter(): void
    {
        $user = User::factory()->create();
        $session = ChatSession::create([
            'user_id' => $user->id,
            'title' => 'Sesi Limit Pesan',
        ]);

        for ($i = 1; $i <= 10; $i++) {
            $msg = ChatHistory::create([
                'chat_session_id' => $session->id,
                'user_id' => $user->id,
                'sender' => 'user',
                'message' => "Message {$i}",
            ]);
            $msg->created_at = Carbon::now()->subMinutes(20 - $i);
            $msg->save();
        }

        $response = $this->actingAs($user, 'sanctum')
            ->getJson("/api/chat-sessions/{$session->id}/messages?limit=4");

        $data = $response->json('data');
        $this->assertCount(4, $data);
        $this->assertEquals('Message 1', $data[0]['message']);
        $this->assertEquals('Message 4', $data[3]['message']);
    }

    public function test_user_cannot_retrieve_messages_from_another_users_session(): void
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();

        $session2 = ChatSession::create([
            'user_id' => $user2->id,
            'title' => 'Sesi User 2',
        ]);

        ChatHistory::create([
            'chat_session_id' => $session2->id,
            'user_id' => $user2->id,
            'sender' => 'user',
            'message' => 'Rahasia User 2',
        ]);

        $this->actingAs($user1, 'sanctum')
            ->getJson("/api/chat-sessions/{$session2->id}/messages")
            ->assertStatus(403);
    }

    public function test_user_can_delete_their_chat_session(): void
    {
        $user = User::factory()->create();
        $session = ChatSession::create([
            'user_id' => $user->id,
            'title' => 'Sesi Akan Dihapus',
        ]);

        $this->actingAs($user, 'sanctum')
            ->deleteJson("/api/chat-sessions/{$session->id}")
            ->assertStatus(200);

        $this->assertSoftDeleted('chat_sessions', [
            'id' => $session->id,
        ]);
    }

    public function test_user_cannot_delete_another_users_chat_session(): void
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();

        $session2 = ChatSession::create([
            'user_id' => $user2->id,
            'title' => 'Sesi User 2',
        ]);

        $this->actingAs($user1, 'sanctum')
            ->deleteJson("/api/chat-sessions/{$session2->id}")
            ->assertStatus(403);

        $this->assertDatabaseHas('chat_sessions', [
            'id' => $session2->id,
            'deleted_at' => null,
        ]);
    }

    public function test_deleted_chat_session_cannot_be_accessed(): void
    {
        $user = User::factory()->create();
        $session = ChatSession::create([
            'user_id' => $user->id,
            'title' => 'Sesi Terhapus',
        ]);
        $session->delete();

        $this->actingAs($user, 'sanctum')
            ->getJson("/api/chat-sessions/{$session->id}")
            ->assertStatus(404);

        $this->actingAs($user, 'sanctum')
            ->postJson("/api/chat-sessions/{$session->id}/messages", [
                'sender' => 'user',
                'message' => 'Pesan ke sesi terhapus',
            ])
            ->assertStatus(404);

        $this->actingAs($user, 'sanctum')
            ->getJson("/api/chat-sessions/{$session->id}/messages")
            ->assertStatus(404);
    }
}
