<?php

namespace Tests\Feature;

use App\Models\Task;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TaskTest extends TestCase
{
    use RefreshDatabase;

    public function test_unauthenticated_user_cannot_access_tasks(): void
    {
        $this->getJson('/api/tasks')->assertStatus(401);
        $this->postJson('/api/tasks', ['title' => 'Test'])->assertStatus(401);
        $this->putJson('/api/tasks/fake-id/toggle')->assertStatus(401);
        $this->deleteJson('/api/tasks/fake-id')->assertStatus(401);
    }

    public function test_user_can_create_task(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/tasks', [
                'title' => 'Complete Math Homework',
            ]);

        $response->assertStatus(201)
            ->assertJson([
                'status' => 'success',
                'message' => 'Task created successfully',
                'data' => [
                    'title' => 'Complete Math Homework',
                    'is_completed' => false,
                    'user_id' => $user->id,
                ],
            ]);

        $this->assertDatabaseHas('tasks', [
            'user_id' => $user->id,
            'title' => 'Complete Math Homework',
            'is_completed' => false,
        ]);
    }

    public function test_create_task_validation(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/tasks', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['title']);
    }

    public function test_user_can_list_own_tasks_sorted_properly(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();

        // Other user's task
        Task::create([
            'user_id' => $otherUser->id,
            'title' => 'Other Task',
            'is_completed' => false,
        ]);

        // Completed task created recently
        $completedTask = Task::create([
            'user_id' => $user->id,
            'title' => 'Completed Task',
            'is_completed' => true,
        ]);
        $completedTask->created_at = Carbon::now();
        $completedTask->save();

        // Incomplete older task
        $olderIncomplete = Task::create([
            'user_id' => $user->id,
            'title' => 'Older Incomplete Task',
            'is_completed' => false,
        ]);
        $olderIncomplete->created_at = Carbon::now()->subHours(2);
        $olderIncomplete->save();

        // Incomplete newer task
        $newerIncomplete = Task::create([
            'user_id' => $user->id,
            'title' => 'Newer Incomplete Task',
            'is_completed' => false,
        ]);
        $newerIncomplete->created_at = Carbon::now()->subHour();
        $newerIncomplete->save();

        $response = $this->actingAs($user, 'sanctum')
            ->getJson('/api/tasks');

        $response->assertStatus(200)
            ->assertJsonCount(3, 'data');

        $data = $response->json('data');

        // Verify uncompleted are first, ordered by created_at desc
        $this->assertEquals($newerIncomplete->id, $data[0]['id']);
        $this->assertFalse($data[0]['is_completed']);

        $this->assertEquals($olderIncomplete->id, $data[1]['id']);
        $this->assertFalse($data[1]['is_completed']);

        // Completed task should be at the bottom
        $this->assertEquals($completedTask->id, $data[2]['id']);
        $this->assertTrue($data[2]['is_completed']);
    }

    public function test_user_can_toggle_task_completion(): void
    {
        $user = User::factory()->create();

        $task = Task::create([
            'user_id' => $user->id,
            'title' => 'Toggle Me',
            'is_completed' => false,
        ]);

        // First toggle: false -> true
        $response = $this->actingAs($user, 'sanctum')
            ->putJson("/api/tasks/{$task->id}/toggle");

        $response->assertStatus(200)
            ->assertJsonPath('data.is_completed', true);

        $this->assertDatabaseHas('tasks', [
            'id' => $task->id,
            'is_completed' => true,
        ]);

        // Second toggle: true -> false
        $response2 = $this->actingAs($user, 'sanctum')
            ->putJson("/api/tasks/{$task->id}/toggle");

        $response2->assertStatus(200)
            ->assertJsonPath('data.is_completed', false);

        $this->assertDatabaseHas('tasks', [
            'id' => $task->id,
            'is_completed' => false,
        ]);
    }

    public function test_user_cannot_toggle_another_users_task(): void
    {
        $userA = User::factory()->create();
        $userB = User::factory()->create();

        $task = Task::create([
            'user_id' => $userA->id,
            'title' => 'User A Task',
            'is_completed' => false,
        ]);

        $response = $this->actingAs($userB, 'sanctum')
            ->putJson("/api/tasks/{$task->id}/toggle");

        $response->assertStatus(403);
    }

    public function test_toggle_nonexistent_task_returns_404(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user, 'sanctum')
            ->putJson('/api/tasks/00000000-0000-0000-0000-000000000000/toggle');

        $response->assertStatus(404);
    }

    public function test_user_can_delete_own_task(): void
    {
        $user = User::factory()->create();

        $task = Task::create([
            'user_id' => $user->id,
            'title' => 'Delete Me',
            'is_completed' => false,
        ]);

        $response = $this->actingAs($user, 'sanctum')
            ->deleteJson("/api/tasks/{$task->id}");

        $response->assertStatus(200)
            ->assertJson([
                'status' => 'success',
                'message' => 'Task deleted successfully',
            ]);

        $this->assertSoftDeleted('tasks', [
            'id' => $task->id,
        ]);
    }

    public function test_user_cannot_delete_another_users_task(): void
    {
        $userA = User::factory()->create();
        $userB = User::factory()->create();

        $task = Task::create([
            'user_id' => $userA->id,
            'title' => 'User A Task',
            'is_completed' => false,
        ]);

        $response = $this->actingAs($userB, 'sanctum')
            ->deleteJson("/api/tasks/{$task->id}");

        $response->assertStatus(403);
    }

    public function test_delete_nonexistent_task_returns_404(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user, 'sanctum')
            ->deleteJson('/api/tasks/00000000-0000-0000-0000-000000000000');

        $response->assertStatus(404);
    }
}
