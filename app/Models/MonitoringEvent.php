<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

class MonitoringEvent extends Model
{
    protected $fillable = [
        'user_id',
        'event_type',
        'event_date',
        'status',
        'notes',
        'checked_items',
        'verified_at',
    ];

    protected function casts(): array
    {
        return [
            'event_date' => 'date',
            'checked_items' => 'array',
            'verified_at' => 'datetime',
        ];
    }

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** @param Builder<MonitoringEvent> $query */
    public function scopeForDate(Builder $query, Carbon|string $date): Builder
    {
        return $query->whereDate('event_date', $date);
    }
}
