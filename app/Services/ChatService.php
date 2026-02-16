<?php

namespace App\Services;

use App\Models\ChatConversation;
use App\Models\ChatMessage;
use Generator;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class ChatService
{
    private string $provider;

    public function __construct(
        private ArticleContextService $articleContext,
        private DocumentSearchService $documentSearch,
        private VectorSearchService $vectorSearch,
        private SanitizationService $sanitization,
    ) {
        $this->provider = config('services.ai.provider', 'openai');
    }

    /**
     * Stream a response from the configured AI provider.
     *
     * @return Generator<int, array{event: string, data: mixed}>
     */
    public function streamResponse(ChatConversation $conversation, string $userMessage): Generator
    {
        // 1. Save user message
        $conversation->messages()->create([
            'role' => 'user',
            'content' => $userMessage,
        ]);

        // 2. Auto-title on first message
        if ($conversation->messages()->count() === 1) {
            $conversation->update([
                'title' => Str::limit($userMessage, 80),
            ]);
        }

        // 3. Build context (semantic vector search with fallback to legacy)
        try {
            $articleCtx = $this->vectorSearch->searchArticles($userMessage);
            $ragCtx = $this->vectorSearch->searchDocuments($userMessage);
        } catch (\Throwable $e) {
            Log::warning('VectorSearch unavailable, falling back to legacy', ['error' => $e->getMessage()]);
            $articleCtx = $this->articleContext->buildContext();
            $ragCtx = $this->documentSearch->search($userMessage);
        }

        // 4. Build system prompt
        $systemPrompt = $this->buildSystemPrompt($articleCtx, $ragCtx);

        // 5. Build messages array
        $messages = $this->buildMessagesArray($conversation);

        // 6. Stream from AI provider
        $fullResponse = '';

        try {
            $streamGenerator = match ($this->provider) {
                'anthropic' => $this->streamAnthropic($systemPrompt, $messages),
                default => $this->streamOpenAI($systemPrompt, $messages),
            };

            foreach ($streamGenerator as $text) {
                $rehydrated = $this->sanitization->rehydrate($text);
                $fullResponse .= $rehydrated;

                yield [
                    'event' => 'delta',
                    'data' => ['text' => $rehydrated],
                ];
            }
        } catch (\Throwable $e) {
            Log::error('ChatService stream error', [
                'provider' => $this->provider,
                'error' => $e->getMessage(),
            ]);

            yield [
                'event' => 'error',
                'data' => ['message' => 'Erreur lors de la communication avec l\'IA'],
            ];

            return;
        }

        // 7. Save assistant message
        if ($fullResponse !== '') {
            $conversation->messages()->create([
                'role' => 'assistant',
                'content' => $fullResponse,
            ]);
        }

        // 8. Signal done
        yield [
            'event' => 'done',
            'data' => ['conversation_id' => $conversation->id],
        ];
    }

    // ─── OpenAI streaming ────────────────────────────────────────────────

    /**
     * @param  array<int, array{role: string, content: string}>  $messages
     * @return Generator<int, string>
     */
    private function streamOpenAI(string $systemPrompt, array $messages): Generator
    {
        $apiMessages = [
            ['role' => 'system', 'content' => $systemPrompt],
            ...$messages,
        ];

        $response = Http::withHeaders([
            'Authorization' => 'Bearer '.config('services.openai.api_key'),
            'Content-Type' => 'application/json',
        ])->withOptions([
            'stream' => true,
        ])->timeout(120)->post('https://api.openai.com/v1/chat/completions', [
            'model' => config('services.openai.model'),
            'max_tokens' => config('services.openai.max_tokens'),
            'messages' => $apiMessages,
            'stream' => true,
        ]);

        yield from $this->parseStream($response->getBody(), 'openai');
    }

    // ─── Anthropic streaming ─────────────────────────────────────────────

    /**
     * @param  array<int, array{role: string, content: string}>  $messages
     * @return Generator<int, string>
     */
    private function streamAnthropic(string $systemPrompt, array $messages): Generator
    {
        $response = Http::withHeaders([
            'x-api-key' => config('services.anthropic.api_key'),
            'anthropic-version' => '2023-06-01',
            'Content-Type' => 'application/json',
        ])->withOptions([
            'stream' => true,
        ])->timeout(120)->post('https://api.anthropic.com/v1/messages', [
            'model' => config('services.anthropic.model'),
            'max_tokens' => config('services.anthropic.max_tokens'),
            'system' => $systemPrompt,
            'messages' => $messages,
            'stream' => true,
        ]);

        yield from $this->parseStream($response->getBody(), 'anthropic');
    }

    // ─── Shared SSE parser ───────────────────────────────────────────────

    /**
     * @return Generator<int, string>
     */
    private function parseStream($body, string $provider): Generator
    {
        $buffer = '';

        while (! $body->eof()) {
            $chunk = $body->read(8192);
            $buffer .= $chunk;

            while (($pos = strpos($buffer, "\n\n")) !== false) {
                $eventBlock = substr($buffer, 0, $pos);
                $buffer = substr($buffer, $pos + 2);

                $data = $this->parseSseEvent($eventBlock);

                if ($data === null) {
                    continue;
                }

                $text = match ($provider) {
                    'openai' => $this->extractOpenAIText($data),
                    'anthropic' => $this->extractAnthropicText($data),
                    default => null,
                };

                if ($text !== null && $text !== '') {
                    yield $text;
                }

                // Check for stop signals
                $stopped = match ($provider) {
                    'openai' => ($data['choices'][0]['finish_reason'] ?? null) !== null,
                    'anthropic' => ($data['type'] ?? '') === 'message_stop',
                    default => false,
                };

                if ($stopped) {
                    return;
                }
            }
        }
    }

    private function extractOpenAIText(array $data): ?string
    {
        // data: {"choices":[{"delta":{"content":"text"},...}]}
        // Also handle: data: [DONE]
        return $data['choices'][0]['delta']['content'] ?? null;
    }

    private function extractAnthropicText(array $data): ?string
    {
        // data: {"type":"content_block_delta","delta":{"text":"text"}}
        if (($data['type'] ?? '') === 'content_block_delta') {
            return $data['delta']['text'] ?? null;
        }

        return null;
    }

    // ─── Helpers ─────────────────────────────────────────────────────────

    private function buildSystemPrompt(string $articleContext, string $ragContext): string
    {
        $prompt = <<<'PROMPT'
Tu es l'assistant IA de l'application PNM (Portabilité des Numéros Mobiles) de Digicel.
Tu aides les utilisateurs à comprendre les processus de portabilité, les systèmes d'information, l'architecture réseau, et les outils utilisés.

Règles :
- Réponds toujours en français.
- Base tes réponses uniquement sur le contexte fourni (articles de la base de connaissances et documents Porta).
- Si tu ne trouves pas l'information dans le contexte, dis-le clairement plutôt que d'inventer.
- Utilise le format Markdown pour structurer tes réponses (titres, listes, gras, code...).
- Sois concis mais complet.
- Quand tu cites un processus ou une procédure, sois précis sur les étapes.

PROMPT;

        if ($articleContext !== '') {
            $prompt .= "\n# Base de connaissances PNM\n\n{$articleContext}\n";
        }

        if ($ragContext !== '') {
            $prompt .= "\n# Documents techniques complémentaires\n\n{$ragContext}\n";
        }

        return $prompt;
    }

    /**
     * @return array<int, array{role: string, content: string}>
     */
    private function buildMessagesArray(ChatConversation $conversation): array
    {
        return $conversation->messages()
            ->orderBy('created_at')
            ->get(['role', 'content'])
            ->map(fn (ChatMessage $m) => [
                'role' => $m->role,
                'content' => $m->content,
            ])
            ->toArray();
    }

    private function parseSseEvent(string $eventBlock): ?array
    {
        $data = null;

        foreach (explode("\n", $eventBlock) as $line) {
            if (str_starts_with($line, 'data: ')) {
                $json = substr($line, 6);

                if (trim($json) === '[DONE]') {
                    return ['choices' => [['finish_reason' => 'stop', 'delta' => []]]];
                }

                $decoded = json_decode($json, true);

                if (is_array($decoded)) {
                    $data = $decoded;
                }
            }
        }

        return $data;
    }
}
