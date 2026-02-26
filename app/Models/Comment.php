<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Comment extends Model
{
    use HasFactory;

    protected $fillable = [
        'post_id', 
        'user_id', 
        'parent_id', 
        'content', 
        'status'
    ];

    // --- RELACIONES ---

    /** El post donde se realizó el comentario */
    public function post(): BelongsTo
    {
        return $this->belongsTo(Post::class);
    }

    /** El autor del comentario */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** Relación Recursiva: El comentario al que este está respondiendo */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(Comment::class, 'parent_id');
    }

    /** Relación Recursiva: Las respuestas que tiene este comentario */
    public function replies(): HasMany
    {
        return $this->hasMany(Comment::class, 'parent_id');
    }
}