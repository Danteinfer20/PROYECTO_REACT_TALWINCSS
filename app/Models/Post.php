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
use Illuminate\Support\Facades\App;

class Post extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id', 'category_id', 'content_type_id', 'title', 
        'slug', 'excerpt', 'content', 'status', 'is_featured', 
        'is_educational', 'view_count', 'share_count', 'allow_comments', 
        'published_at'
    ];

    // 🔥 Scope para carga flexible (Reemplaza al $with global para evitar bloqueos)
    public function scopeWithDefaultRelations($query)
    {
        return $query->with(['user', 'category', 'contentType']);
    }

    protected function casts(): array
    {
        return [
            'is_featured' => 'boolean',
            'is_educational' => 'boolean',
            'allow_comments' => 'boolean',
            'view_count' => 'integer',
            'share_count' => 'integer',
            'published_at' => 'datetime',
            // 🔥 Añadimos casts a JSON para los campos multilingües (opcional, pero útil)
            'title' => 'json',
            'excerpt' => 'json',
            'content' => 'json',
        ];
    }

    // ==========================================
    // 🔥 ACCESSORS (GETTERS) PARA MULTILENGUAJE
    // ==========================================
    
    public function getTitleAttribute($value)
    {
        $locale = App::getLocale();
        $data = json_decode($value, true);
        return $data[$locale] ?? ($data['es'] ?? $value);
    }

    public function getExcerptAttribute($value)
    {
        $locale = App::getLocale();
        $data = json_decode($value, true);
        return $data[$locale] ?? ($data['es'] ?? $value);
    }

    public function getContentAttribute($value)
    {
        $locale = App::getLocale();
        $data = json_decode($value, true);
        return $data[$locale] ?? ($data['es'] ?? $value);
    }

    // ==========================================
    // 🔥 MUTATORS (SETTERS) PARA GUARDAR COMO JSON
    // ==========================================
    
    public function setTitleAttribute($value)
    {
        // Si ya es un JSON válido, lo dejamos; si no, lo convertimos a {"es": "valor"}
        if (is_string($value) && json_decode($value) !== null) {
            $this->attributes['title'] = $value;
        } else {
            $this->attributes['title'] = json_encode(['es' => $value], JSON_UNESCAPED_UNICODE);
        }
    }

    public function setExcerptAttribute($value)
    {
        if (is_string($value) && json_decode($value) !== null) {
            $this->attributes['excerpt'] = $value;
        } else {
            $this->attributes['excerpt'] = json_encode(['es' => $value], JSON_UNESCAPED_UNICODE);
        }
    }

    public function setContentAttribute($value)
    {
        if (is_string($value) && json_decode($value) !== null) {
            $this->attributes['content'] = $value;
        } else {
            $this->attributes['content'] = json_encode(['es' => $value], JSON_UNESCAPED_UNICODE);
        }
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
    // 🔥 RELACIONES POLIMÓRFICAS
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
    // 🎯 ELOQUENT SCOPES
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