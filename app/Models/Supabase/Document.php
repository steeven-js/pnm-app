<?php

namespace App\Models\Supabase;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Document extends Model
{
    protected $connection = 'supabase';

    protected $fillable = [
        'title',
        'description',
        'source_file',
        'source_type',
        'document_type',
        'total_sections',
    ];

    public function sections(): HasMany
    {
        return $this->hasMany(DocumentSection::class);
    }

    public function rootSections(): HasMany
    {
        return $this->hasMany(DocumentSection::class)
            ->whereNull('parent_section_id')
            ->orderBy('section_index');
    }
}
