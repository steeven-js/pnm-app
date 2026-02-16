<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class PnmCode extends Model
{
    protected $fillable = [
        'code',
        'category',
        'subcategory',
        'label',
        'description',
        'probable_cause',
        'recommended_action',
        'severity',
        'sort_order',
    ];

    public function getRouteKeyName(): string
    {
        return 'code';
    }

    public function scopeCategory(Builder $query, string $category): Builder
    {
        return $query->where('category', $category);
    }

    public function scopeSearch(Builder $query, string $search): Builder
    {
        return $query->where(function ($q) use ($search) {
            $q->where('code', 'like', "%{$search}%")
                ->orWhere('label', 'like', "%{$search}%")
                ->orWhere('description', 'like', "%{$search}%");
        });
    }
}
