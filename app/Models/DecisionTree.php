<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DecisionTree extends Model
{
    protected $fillable = [
        'title',
        'slug',
        'description',
        'icon',
        'tree_data',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'tree_data' => 'array',
        ];
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }
}
