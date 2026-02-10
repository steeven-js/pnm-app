<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class GlossaryTerm extends Model
{
    protected $fillable = [
        'term',
        'slug',
        'abbreviation',
        'definition',
        'category',
    ];

    public function articles(): BelongsToMany
    {
        return $this->belongsToMany(Article::class, 'article_glossary_term');
    }
}
