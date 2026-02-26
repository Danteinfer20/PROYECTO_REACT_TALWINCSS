<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ContentType extends Model
{
    use HasFactory;

    /** Campos que se pueden llenar masivamente */
    protected $fillable = [
        'name',
        'description',
        'allows_events',
        'allows_education',
        'icon'
    ];

    /** Conversión de tipos */
    protected $casts = [
        'allows_events' => 'boolean',
        'allows_education' => 'boolean',
    ];

    // --- RELACIONES ---

    /** Un Tipo de Contenido puede tener muchos Posts vinculados */
    public function posts(): HasMany
    {
        return $this->hasMany(Post::class);
    }
}