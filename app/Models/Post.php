<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class Post extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id', 'category_id', 'content_type_id', 'title', 
        'slug', 'excerpt', 'content', 'status', 'is_featured', 
        'is_educational', 'view_count', 'share_count', 'allow_comments', 
        'published_at'
    ];

    // 🔥 Eager loading automático para evitar el problema N+1 en las vistas
    protected $with = ['user', 'category', 'contentType'];

    protected function casts(): array
    {
        return [
            'is_featured' => 'boolean',
            'is_educational' => 'boolean',
            'allow_comments' => 'boolean',
            'view_count' => 'integer',
            'share_count' => 'integer',
            'published_at' => 'datetime',
        ];
    }

    // ==========================================
    // 🔗 RELACIONES DIRECTAS
    // ==========================================
    
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function contentType(): BelongsTo
    {
        return $this->belongsTo(ContentType::class);
    }

    /**
     * 🔥 RELACIÓN PARA EL SEEDER Y EL FRONTEND
     * Sincronizada con el DatabaseSeeder para evitar el error "undefined method"
     */
    public function postMedia(): HasMany
    {
        return $this->hasMany(PostMedia::class)->orderBy('sort_order');
    }

    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class, 'post_tags');
    }

    public function event(): HasOne
    {
        return $this->hasOne(Event::class);
    }

    public function educationalContent(): HasOne
    {
        return $this->hasOne(EducationalContent::class);
    }

    // ==========================================
    // 🔥 RELACIONES POLIMÓRFICAS (COMENTARIOS, REACCIONES, GUARDADOS)
    // ==========================================
    
    public function comments(): MorphMany
    {
        return $this->morphMany(Comment::class, 'commentable');
    }

    public function reactions(): MorphMany
    {
        return $this->morphMany(Reaction::class, 'reactable');
    }

    public function savedItems(): MorphMany
    {
        return $this->morphMany(SavedItem::class, 'savable');
    }

    // ==========================================
    // 🎯 ELOQUENT SCOPES (Filtros Inteligentes Restaurados)
    // ==========================================
    
    public function scopePublished($query)
    {
        return $query->where('status', 'published')
                     ->whereNotNull('published_at')
                     ->where('published_at', '<=', now());
    }

    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    public function scopeEducational($query)
    {
        return $query->where('is_educational', true);
    }

    /**
     * Scope de búsqueda avanzada usando ILIKE para compatibilidad con PostgreSQL
     */
    public function scopeSearch($query, $term)
    {
        return $query->where(function ($q) use ($term) {
            $q->where('title', 'ilike', "%{$term}%")
              ->orWhere('excerpt', 'ilike', "%{$term}%")
              ->orWhere('content', 'ilike', "%{$term}%");
        });
    }
}