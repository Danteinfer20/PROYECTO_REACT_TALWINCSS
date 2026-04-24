<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Comment extends Model
{
    use HasFactory;

    protected $fillable = [
        'commentable_type', 'commentable_id', 'user_id', 
        'parent_id', 'content', 'like_count', 'is_edited', 'status'
    ];

    // 🔥 Eager Loading: Siempre que traigas un comentario, trae al autor automáticamente.
    protected $with = ['user'];

    protected function casts(): array
    {
        return [
            'like_count' => 'integer',
            'is_edited' => 'boolean',
        ];
    }

    // ==========================================
    // 🔥 EL NÚCLEO POLIMÓRFICO
    // Esto sabe automáticamente si el comentario es de un Post, Producto o Evento
    // ==========================================
    public function commentable(): MorphTo
    {
        return $this->morphTo();
    }

    // ==========================================
    // 🔗 RELACIONES DIRECTAS
    // ==========================================
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // 🔥 Autorreferencia: Para hacer hilos de comentarios (respuestas)
    public function parent(): BelongsTo
    {
        return $this->belongsTo(Comment::class, 'parent_id');
    }

    public function replies(): HasMany
    {
        return $this->hasMany(Comment::class, 'parent_id');
    }

    // ==========================================
    // 🎯 SCOPES
    // ==========================================
    public function scopeVisible($query)
    {
        return $query->where('status', 'visible');
    }
}