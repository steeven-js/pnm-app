<?php

namespace App\Models\Supabase;

use Illuminate\Database\Eloquent\Model;

class ArticleSection extends Model
{
    protected $connection = 'supabase';

    protected $fillable = [
        'article_id',
        'level',
        'section_path',
        'domain_name',
        'title',
        'content',
        'embedding',
    ];
}
