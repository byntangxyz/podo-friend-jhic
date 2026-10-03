<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreChatHistoryRequest;
use App\Http\Resources\ChatHistoryResource;
use App\Models\ChatHistory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ChatHistoryController extends Controller
{
    /**
     * Store a chat message log.
     */
    public function store(StoreChatHistoryRequest $request): JsonResponse
    {
        $chat = ChatHistory::create([
            'user_id' => $request->user()->id,
            'sender' => $request->validated('sender'),
            'message' => $request->validated('message'),
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Chat message stored successfully',
            'data' => new ChatHistoryResource($chat),
        ], 201);
    }

    /**
     * Retrieve chat history in chronological order.
     */
    public function index(Request $request): JsonResponse
    {
        $limit = min(100, max(1, (int) $request->input('limit', 50)));

        $messages = ChatHistory::where('user_id', $request->user()->id)
            ->latest('created_at')
            ->limit($limit)
            ->get()
            ->reverse()
            ->values();

        return response()->json([
            'status' => 'success',
            'message' => 'Chat history retrieved successfully',
            'data' => ChatHistoryResource::collection($messages),
        ], 200);
    }
}
