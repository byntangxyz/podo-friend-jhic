<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreChatMessageRequest;
use App\Http\Requests\StoreChatSessionRequest;
use App\Http\Resources\ChatHistoryResource;
use App\Http\Resources\ChatSessionResource;
use App\Models\ChatHistory;
use App\Models\ChatSession;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ChatSessionController extends Controller
{
    /**
     * Retrieve all chat sessions for the authenticated user.
     */
    public function index(Request $request): JsonResponse
    {
        $sessions = ChatSession::where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'status' => 'success',
            'message' => 'Chat sessions retrieved successfully',
            'data' => ChatSessionResource::collection($sessions),
        ], 200);
    }

    /**
     * Create a new chat session.
     */
    public function store(StoreChatSessionRequest $request): JsonResponse
    {
        $session = ChatSession::create([
            'user_id' => $request->user()->id,
            'title' => $request->validated('title'),
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Chat session created successfully',
            'data' => new ChatSessionResource($session),
        ], 201);
    }

    /**
     * Retrieve a specific chat session.
     */
    public function show(Request $request, string $sessionId): JsonResponse
    {
        $session = $this->findAndAuthorizeSession($request->user()->id, $sessionId);

        return response()->json([
            'status' => 'success',
            'message' => 'Chat session retrieved successfully',
            'data' => new ChatSessionResource($session),
        ], 200);
    }

    /**
     * Store a message in a specific chat session.
     */
    public function storeMessage(StoreChatMessageRequest $request, string $sessionId): JsonResponse
    {
        $session = $this->findAndAuthorizeSession($request->user()->id, $sessionId);

        $chat = ChatHistory::create([
            'chat_session_id' => $session->id,
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
     * Retrieve all messages from a specific chat session in ascending chronological order.
     */
    public function showMessages(Request $request, string $sessionId): JsonResponse
    {
        $session = $this->findAndAuthorizeSession($request->user()->id, $sessionId);

        $query = ChatHistory::where('chat_session_id', $session->id)
            ->orderBy('created_at', 'asc');

        if ($request->filled('limit')) {
            $limit = min(200, max(1, (int) $request->input('limit')));
            $query->limit($limit);
        }

        $messages = $query->get();

        return response()->json([
            'status' => 'success',
            'message' => 'Chat messages retrieved successfully',
            'data' => ChatHistoryResource::collection($messages),
        ], 200);
    }

    /**
     * Soft-delete a chat session.
     */
    public function destroy(Request $request, string $sessionId): JsonResponse
    {
        $session = $this->findAndAuthorizeSession($request->user()->id, $sessionId);
        $session->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Chat session deleted successfully',
        ], 200);
    }

    /**
     * Find session and verify user ownership.
     */
    private function findAndAuthorizeSession(string $userId, string $sessionId): ChatSession
    {
        $session = ChatSession::find($sessionId);

        if (!$session) {
            abort(404, 'Chat session not found');
        }

        if ($session->user_id !== $userId) {
            abort(403, 'Unauthorized access to chat session');
        }

        return $session;
    }
}
