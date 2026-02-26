<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PostMedia extends Model
{
    use HasFactory;

    protected $table = 'post_media';

    // 🔥 LA SOLUCIÓN AL ERROR: Desactiva el manejo automático de fechas
    // Esto evita que Laravel busque la columna 'updated_at'
    public $timestamps = false; 

    protected $fillable = [
        'post_id', 
        'file_type', 
        'file_path', 
        'file_name', 
        'file_size', 
        'sort_order', 
        'alt_text', 
        'is_cover'
    ];

    protected $casts = [
        'file_size' => 'integer',
        'sort_order' => 'integer',
        'is_cover' => 'boolean',
    ];

    /** Relación con el Post */
    public function post(): BelongsTo
    {
        return $this->belongsTo(Post::class);
    }
}