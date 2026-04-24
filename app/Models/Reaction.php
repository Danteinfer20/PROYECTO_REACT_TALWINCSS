<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Reaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'reactable_type', 'reactable_id', 'user_id', 'reaction_type'
    ];

    // 🔥 Magia Polimórfica
    public function reactable(): MorphTo
    {
        return $this->morphTo();
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // 🎯 SCOPES: Filtros ultra rápidos
    public function scopeOfType($query, $type)
    {
        return $query->where('reaction_type', $type);
    }
}