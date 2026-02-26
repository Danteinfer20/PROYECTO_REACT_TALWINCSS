<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Post extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'category_id', 'content_type_id', 'title', 
        'slug', 'excerpt', 'content', 'status', 
        'is_featured', 'is_educational', 'view_count', 
        'share_count', 'allow_comments', 'published_at', 'image_path'
    ];

    protected $casts = [
        'is_featured' => 'boolean',
        'is_educational' => 'boolean',
        'allow_comments' => 'boolean',
        'published_at' => 'datetime',
    ];

    // --- RELACIONES ---

    /** El autor del post */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** Tipo de contenido (Obra, Evento, etc.) */
    public function contentType(): BelongsTo
    {
        return $this->belongsTo(ContentType::class);
    }

    /** Categoría a la que pertenece */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /** Si el post es un evento, tiene detalles adicionales */
    public function event(): HasOne
    {
        return $this->hasOne(Event::class);
    }

    /** Multimedia asociada (fotos, videos) */
    public function media(): HasMany
    {
        return $this->hasMany(PostMedia::class);
    }

    /** Comentarios recibidos */
    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class);
    }

    /** Reacciones (Likes, etc) */
    public function reactions(): HasMany
    {
        return $this->hasMany(Reaction::class);
    }

    /** Relación N:N con Etiquetas (Tags) */
    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class, 'post_tags');
    }
}
