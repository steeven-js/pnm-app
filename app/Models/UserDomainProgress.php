<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserDomainProgress extends Model
{
    protected $table = 'user_domain_progress';

    protected $fillable = [
        'user_id',
        'domain_id',
        'articles_read',
        'articles_total',
        'completion_percentage',
    ];

    protected function casts(): array
    {
        return [
            'completion_percentage' => 'decimal:2',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function domain(): BelongsTo
    {
        return $this->belongsTo(KnowledgeDomain::class, 'domain_id');
    }
}
