<?php

namespace App\Http\Controllers;

use App\Models\ChatConversation;
use App\Services\ChatService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ChatController extends Controller
{
    /**
     * List user's conversations.
     */
    public function index(Request $request): JsonResponse
    {
        $conversations = $request->user()
            ->chatConversations()
            ->orderByDesc('updated_at')
            ->get(['id', 'title', 'updated_at']);

        return response()->json($conversations);
    }

    /**
     * Show a conversation with its messages.
     */
    public function show(Request $request, ChatConversation $conversation): JsonResponse
    {
        abort_unless($conversation->user_id === $request->user()->id, 403);

        $conversation->load('messages:id,conversation_id,role,content,created_at');

        return response()->json($conversation);
    }

    /**
     * Stream a response via SSE.
     */
    public function stream(Request $request, ChatService $chatService): StreamedResponse
    {
        $validated = $request->validate([
            'message' => 'required|string|max:4000',
            'conversation_id' => 'nullable|integer|exists:chat_conversations,id',
        ]);

        $user = $request->user();

        // Get or create conversation
        if (! empty($validated['conversation_id'])) {
            $conversation = ChatConversation::where('id', $validated['conversation_id'])
                ->where('user_id', $user->id)
                ->firstOrFail();
        } else {
            $conversation = $user->chatConversations()->create();
        }

        return new StreamedResponse(function () use ($chatService, $conversation, $validated) {
            // Disable output buffering for real-time streaming
            while (ob_get_level()) {
                ob_end_flush();
            }

            foreach ($chatService->streamResponse($conversation, $validated['message']) as $event) {
                echo 'data: '.json_encode($event)."\n\n";
                flush();
            }
        }, 200, [
            'Content-Type' => 'text/event-stream',
            'Cache-Control' => 'no-cache',
            'Connection' => 'keep-alive',
            'X-Accel-Buffering' => 'no',
        ]);
    }

    /**
     * Delete a conversation.
     */
    public function destroy(Request $request, ChatConversation $conversation): JsonResponse
    {
        abort_unless($conversation->user_id === $request->user()->id, 403);

        $conversation->delete();

        return response()->json(['message' => 'Conversation supprimée']);
    }
}
