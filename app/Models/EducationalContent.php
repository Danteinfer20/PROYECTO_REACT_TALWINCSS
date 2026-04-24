<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EducationalContent extends Model
{
    use HasFactory;

    // Fíjate que en la DB se llama educational_content, Laravel lo asume en plural (educational_contents).
    // Para evitar problemas si tu tabla se llama distinto, a veces es bueno forzar el nombre de la tabla:
    protected $table = 'educational_content';

    protected $fillable = [
        'post_id', 'difficulty_level', 'estimated_read_time', 
        'learning_objectives', 'related_topics', 'ai_generated', 
        'knowledge_area', 'historical_period', 'cultural_significance'
    ];

    protected function casts(): array
    {
        return [
            'estimated_read_time' => 'integer',
            'ai_generated' => 'boolean',
            'learning_objectives' => 'array', // 🔥 Magia PostgreSQL -> Array PHP
            'related_topics' => 'array',      // 🔥 Magia PostgreSQL -> Array PHP
        ];
    }

    public function post(): BelongsTo
    {
        return $this->belongsTo(Post::class);
    }
}