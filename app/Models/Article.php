<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Article extends Model
{
    protected $fillable = [
        'domain_id',
        'parent_id',
        'title',
        'slug',
        'excerpt',
        'content',
        'level',
        'sort_order',
        'reading_time_minutes',
        'is_published',
    ];

    protected function casts(): array
    {
        return [
            'is_published' => 'boolean',
        ];
    }

    public function domain(): BelongsTo
    {
        return $this->belongsTo(KnowledgeDomain::class, 'domain_id');
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(Article::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(Article::class, 'parent_id')
            ->where('is_published', true)
            ->orderBy('sort_order');
    }

    public function glossaryTerms(): BelongsToMany
    {
        return $this->belongsToMany(GlossaryTerm::class, 'article_glossary_term');
    }
}
