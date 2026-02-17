<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class DocumentChunk extends Model
{
    protected $fillable = [
        'source_file',
        'source_type',
        'chunk_index',
        'heading',
        'content',
    ];

    /**
     * Full-text search scope using PostgreSQL tsvector.
     */
    public function scopeSearch(Builder $query, string $search, int $limit = 5): Builder
    {
        return $query
            ->whereRaw("searchable @@ plainto_tsquery('french', ?)", [$search])
            ->orderByRaw("ts_rank(searchable, plainto_tsquery('french', ?)) DESC", [$search])
            ->limit($limit);
    }
}
