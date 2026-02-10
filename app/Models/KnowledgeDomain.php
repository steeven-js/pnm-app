<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class KnowledgeDomain extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'description',
        'icon',
        'color',
        'sort_order',
    ];

    public function articles(): HasMany
    {
        return $this->hasMany(Article::class, 'domain_id');
    }

    public function rootArticles(): HasMany
    {
        return $this->hasMany(Article::class, 'domain_id')
            ->whereNull('parent_id')
            ->where('is_published', true)
            ->orderBy('sort_order');
    }

    public function publishedArticles(): HasMany
    {
        return $this->hasMany(Article::class, 'domain_id')
            ->where('is_published', true)
            ->orderBy('sort_order');
    }
}
