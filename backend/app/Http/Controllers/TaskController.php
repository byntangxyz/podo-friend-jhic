<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTaskRequest;
use App\Http\Resources\TaskResource;
use App\Models\Task;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    /**
     * Retrieve all tasks for the authenticated user, ordered incomplete first, then by created_at.
     */
    public function index(Request $request): JsonResponse
    {
        $tasks = Task::where('user_id', $request->user()->id)
            ->orderBy('is_completed', 'asc')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'status' => 'success',
            'message' => 'Tasks retrieved successfully',
            'data' => TaskResource::collection($tasks),
        ], 200);
    }

    /**
     * Create a new task for the authenticated user.
     */
    public function store(StoreTaskRequest $request): JsonResponse
    {
        $task = Task::create([
            'user_id' => $request->user()->id,
            'title' => $request->validated('title'),
            'is_completed' => false,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Task created successfully',
            'data' => new TaskResource($task),
        ], 201);
    }

    /**
     * Toggle completion status of the specified task.
     */
    public function toggle(Request $request, string $id): JsonResponse
    {
        $task = $this->findAndAuthorizeTask($request->user()->id, $id);

        $task->update([
            'is_completed' => ! $task->is_completed,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Task completion toggled successfully',
            'data' => new TaskResource($task),
        ], 200);
    }

    /**
     * Delete the specified task.
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        $task = $this->findAndAuthorizeTask($request->user()->id, $id);
        $task->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Task deleted successfully',
        ], 200);
    }

    /**
     * Find task and authorize user ownership.
     */
    private function findAndAuthorizeTask(string $userId, string $taskId): Task
    {
        $task = Task::find($taskId);

        if (! $task) {
            abort(404, 'Task not found');
        }

        if ($task->user_id !== $userId) {
            abort(403, 'Unauthorized access to task');
        }

        return $task;
    }
}
