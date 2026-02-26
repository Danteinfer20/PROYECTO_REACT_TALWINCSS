<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PerformingArt extends Model
{
    use HasFactory;

    protected $fillable = [
        'event_id', 'art_type', 'duration_minutes', 
        'artistic_director', 'company', 'genre', 
        'target_audience', 'technical_requirements', 'cast_members'
    ];

    protected $casts = [
        'duration_minutes' => 'integer',
        'cast_members' => 'array', // Convierte el JSONB de la BD en un Array de PHP
    ];

    // --- RELACIONES ---

    /** Pertenece a un Evento específico */
    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }
}