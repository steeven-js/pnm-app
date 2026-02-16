<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

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
     * Full-text search scope.
     * Uses PostgreSQL tsvector in production, LIKE fallback for SQLite.
     */
    public function scopeSearch(Builder $query, string $search, int $limit = 5): Builder
    {
        if (DB::getDriverName() === 'pgsql') {
            return $query
                ->whereRaw("searchable @@ plainto_tsquery('french', ?)", [$search])
                ->orderByRaw("ts_rank(searchable, plainto_tsquery('french', ?)) DESC", [$search])
                ->limit($limit);
        }

        // SQLite fallback: simple LIKE search
        $terms = explode(' ', $search);

        return $query->where(function (Builder $q) use ($terms) {
            foreach ($terms as $term) {
                $q->where(function (Builder $inner) use ($term) {
                    $inner->where('content', 'like', "%{$term}%")
                        ->orWhere('heading', 'like', "%{$term}%");
                });
            }
        })->limit($limit);
    }
}
