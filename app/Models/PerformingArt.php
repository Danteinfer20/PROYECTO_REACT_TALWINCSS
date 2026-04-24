<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PerformingArt extends Model
{
    use HasFactory;

    protected $fillable = [
        'event_id', 'art_type', 'duration_minutes', 'artistic_director', 
        'company', 'genre', 'target_audience', 'technical_requirements', 
        'cast_members'
    ];

    protected function casts(): array
    {
        return [
            'duration_minutes' => 'integer',
            'cast_members' => 'array', // 🔥 Magia PostgreSQL -> PHP
        ];
    }

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }
}