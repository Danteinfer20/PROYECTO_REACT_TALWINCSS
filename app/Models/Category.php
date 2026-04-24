<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Category extends Model
{
    use HasFactory;

    protected $fillable = [
        'name', 'description', 'icon', 'color', 'slug', 
        'category_type', 'is_active', 'sort_order', 'parent_id'
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ];
    }

    // ==========================================
    // 🔗 RELACIONES RECURSIVAS (Categorías y Subcategorías)
    // ==========================================
    public function parent(): BelongsTo
    {
        return $this->belongsTo(Category::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(Category::class, 'parent_id')->orderBy('sort_order');
    }

    // ==========================================
    // 🔗 RELACIONES DIRECTAS
    // ==========================================
    public function posts(): HasMany
    {
        return $this->hasMany(Post::class);
    }

    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }

    // ==========================================
    // 🎯 SCOPES
    // ==========================================
    public function scopeActive($query)
    {
        return $query->where('is_active', true)->orderBy('sort_order');
    }

    public function scopeOfType($query, $type)
    {
        return $query->where('category_type', $type);
    }

    // Solo trae las categorías principales (las que no son subcategorías)
    public function scopeParentsOnly($query)
    {
        return $query->whereNull('parent_id');
    }
}