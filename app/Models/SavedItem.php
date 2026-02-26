<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SavedItem extends Model
{
    use HasFactory;

    // 🛑 CRÍTICO: Evita el error 500 diciéndole a Laravel que no busque la columna 'updated_at'
    const UPDATED_AT = null;

    // ✅ Campos exactos que coinciden con tu base de datos PostgreSQL
    protected $fillable = [
        'user_id', 
        'post_id', 
        'category'
    ];

    // --- RELACIONES ---

    /** * El usuario que guardó la obra en favoritos
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** * La obra (post) específica que fue guardada
     */
    public function post(): BelongsTo
    {
        return $this->belongsTo(Post::class);
    }
}