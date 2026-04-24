<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AiRecommendation extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'recommended_post_id', 'recommendation_type', 
        'confidence_score', 'reason'
    ];

    protected function casts(): array
    {
        return [
            // Casteamos a decimal para manejar el porcentaje de confianza de la IA (Ej: 0.95)
            'confidence_score' => 'decimal:2', 
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function recommendedPost(): BelongsTo
    {
        return $this->belongsTo(Post::class, 'recommended_post_id');
    }
}