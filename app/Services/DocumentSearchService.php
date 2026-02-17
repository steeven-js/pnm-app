<?php

namespace App\Services;

use App\Models\DocumentChunk;

class DocumentSearchService
{
    /**
     * Search document chunks and return formatted context.
     */
    public function search(string $query, int $limit = 5): string
    {
        $chunks = DocumentChunk::search($query, $limit)->get();

        if ($chunks->isEmpty()) {
            return '';
        }

        $context = "## Documents Porta pertinents\n\n";

        foreach ($chunks as $chunk) {
            $heading = $chunk->heading ? " — {$chunk->heading}" : '';
            $context .= "### {$chunk->source_file}{$heading}\n";
            $context .= "{$chunk->content}\n\n";
        }

        return $context;
    }
}
