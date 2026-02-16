<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class EmbeddingService
{
    private string $model;

    private int $dimensions;

    public function __construct()
    {
        $this->model = config('services.embedding.model', 'text-embedding-3-small');
        $this->dimensions = config('services.embedding.dimensions', 1536);
    }

    /**
     * Generate an embedding vector for a single text.
     *
     * @return float[]
     */
    public function embed(string $text): array
    {
        $text = $this->truncate($text);

        $response = Http::withHeaders([
            'Authorization' => 'Bearer '.config('services.openai.api_key'),
        ])->timeout(30)->post('https://api.openai.com/v1/embeddings', [
            'model' => $this->model,
            'input' => $text,
            'dimensions' => $this->dimensions,
        ]);

        if (! $response->successful()) {
            Log::error('EmbeddingService: OpenAI API error', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);
            throw new \RuntimeException('Failed to generate embedding: '.$response->status());
        }

        return $response->json('data.0.embedding');
    }

    /**
     * Generate embeddings for multiple texts in batch (max 20 per call).
     *
     * @param  string[]  $texts
     * @return array<int, float[]>
     */
    public function embedBatch(array $texts): array
    {
        // Filter out empty/whitespace-only texts and replace with a placeholder
        $texts = array_map(fn (string $t) => trim($t) === '' ? '(empty section)' : $t, $texts);

        $results = [];

        foreach (array_chunk($texts, 20) as $batch) {
            $batch = array_values(array_map(fn (string $t) => $this->truncate($t), $batch));

            $response = Http::withHeaders([
                'Authorization' => 'Bearer '.config('services.openai.api_key'),
            ])->timeout(60)->post('https://api.openai.com/v1/embeddings', [
                'model' => $this->model,
                'input' => $batch,
                'dimensions' => $this->dimensions,
            ]);

            if (! $response->successful()) {
                $error = $response->json('error.message', $response->body());
                Log::error('EmbeddingService: batch API error', [
                    'status' => $response->status(),
                    'error' => $error,
                    'batch_sizes' => array_map('mb_strlen', $batch),
                ]);
                throw new \RuntimeException("Embedding API error ({$response->status()}): {$error}");
            }

            $data = $response->json('data');

            // Sort by index to preserve order
            usort($data, fn ($a, $b) => $a['index'] <=> $b['index']);

            foreach ($data as $item) {
                $results[] = $item['embedding'];
            }
        }

        return $results;
    }

    /**
     * Truncate text to stay under 8192 tokens.
     * Conservative limit: tabular data tokenizes at ~1 char/token.
     */
    private function truncate(string $text): string
    {
        $maxChars = 7500;

        if (mb_strlen($text) > $maxChars) {
            return mb_substr($text, 0, $maxChars);
        }

        return $text;
    }
}
