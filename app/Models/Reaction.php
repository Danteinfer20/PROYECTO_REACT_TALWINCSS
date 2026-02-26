<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Reaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'post_id', 
        'user_id', 
        'reaction_type'
    ];

    // --- RELACIONES ---

    /** El post que recibió la reacción */
    public function post(): BelongsTo
    {
        return $this->belongsTo(Post::class);
    }

    /** El usuario que reaccionó */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}