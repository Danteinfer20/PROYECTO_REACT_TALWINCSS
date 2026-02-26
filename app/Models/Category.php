<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Category extends Model
{
    use HasFactory;

    protected $fillable = [
        'name', 'description', 'icon', 'color', 
        'slug', 'category_type', 'is_active', 
        'sort_order', 'parent_id'
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];

    // --- RELACIONES ---

    /** Relación Recursiva: Una categoría puede tener una categoría padre */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(Category::class, 'parent_id');
    }

    /** Relación Recursiva: Una categoría puede tener muchas subcategorías (hijos) */
    public function children(): HasMany
    {
        return $this->hasMany(Category::class, 'parent_id')->orderBy('sort_order');
    }

    /** Una categoría tiene muchos posts vinculados */
    public function posts(): HasMany
    {
        return $this->hasMany(Post::class);
    }
}