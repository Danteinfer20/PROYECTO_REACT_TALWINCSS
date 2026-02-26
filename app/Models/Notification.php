<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Notification extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 
        'type', 
        'title', 
        'message', 
        'data', 
        'read_at'
    ];

    protected $casts = [
        'data' => 'array', // Para guardar detalles extra como IDs de posts o fotos
        'read_at' => 'datetime',
    ];

    // --- RELACIONES ---

    /** La notificación pertenece a un usuario específico */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}