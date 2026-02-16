<?php

namespace App\Models\Supabase;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class DocumentSection extends Model
{
    protected $connection = 'supabase';

    protected $fillable = [
        'document_id',
        'section_index',
        'level',
        'parent_section_id',
        'section_path',
        'title',
        'content',
        'embedding',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'metadata' => 'array',
        ];
    }

    public function document(): BelongsTo
    {
        return $this->belongsTo(Document::class);
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(DocumentSection::class, 'parent_section_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(DocumentSection::class, 'parent_section_id')
            ->orderBy('section_index');
    }
}
