<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;

class VectorSearchService
{
    public function __construct(
        private EmbeddingService $embedding,
    ) {}

    /**
     * Search document sections by semantic similarity.
     * Returns structured context with document hierarchy.
     */
    public function searchDocuments(string $query, int $limit = 5): string
    {
        $vector = $this->embedding->embed($query);
        $vectorSql = '['.implode(',', $vector).']';

        $results = DB::connection('supabase')
            ->select("
                SELECT
                    ds.title,
                    ds.content,
                    ds.level,
                    ds.section_path,
                    d.title AS document_title,
                    d.document_type,
                    d.source_file,
                    1 - (ds.embedding <=> ?::vector) AS similarity
                FROM document_sections ds
                JOIN documents d ON d.id = ds.document_id
                WHERE 1 - (ds.embedding <=> ?::vector) > 0.3
                ORDER BY ds.embedding <=> ?::vector
                LIMIT ?
            ", [$vectorSql, $vectorSql, $vectorSql, $limit]);

        if (empty($results)) {
            return '';
        }

        $context = "## Documents techniques pertinents\n\n";

        foreach ($results as $row) {
            $similarity = round($row->similarity * 100);
            $type = mb_strtoupper($row->document_type);
            $path = $row->section_path ?? $row->title ?? '';

            $context .= "### [{$type}] {$row->document_title}";
            if ($path) {
                $context .= " > {$path}";
            }
            $context .= " ({$similarity}%)\n";
            $context .= "{$row->content}\n\n";
        }

        return $context;
    }

    /**
     * Search article sections by semantic similarity.
     * Returns structured context with section hierarchy.
     */
    public function searchArticles(string $query, int $limit = 5): string
    {
        $vector = $this->embedding->embed($query);
        $vectorSql = '['.implode(',', $vector).']';

        $results = DB::connection('supabase')
            ->select("
                SELECT
                    title,
                    content,
                    domain_name,
                    section_path,
                    article_id,
                    1 - (embedding <=> ?::vector) AS similarity
                FROM article_sections
                WHERE 1 - (embedding <=> ?::vector) > 0.3
                ORDER BY embedding <=> ?::vector
                LIMIT ?
            ", [$vectorSql, $vectorSql, $vectorSql, $limit]);

        if (empty($results)) {
            return '';
        }

        $context = '';

        foreach ($results as $row) {
            $similarity = round($row->similarity * 100);
            $path = $row->section_path ?? $row->title;

            $context .= "## [{$row->domain_name}] {$path} ({$similarity}%)\n";
            $context .= "{$row->content}\n\n";
        }

        return $context;
    }
}
