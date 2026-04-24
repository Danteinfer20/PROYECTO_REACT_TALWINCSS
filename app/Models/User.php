<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\SoftDeletes; // 🔥 Agregado
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class User extends Authenticatable
{
    // 🔥 Activamos SoftDeletes para que al eliminar un usuario, sus ventas o posts no colapsen
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    protected $fillable = [
        'name', 'username', 'email', 'password', 'user_type', 
        'birth_date', 'gender', 'phone', 'city', 'neighborhood', 
        'bio', 'profile_picture', 'cover_picture', 'website', 
        'social_media', 'status', 'is_verified'
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'social_media' => 'array', // 🔥 Magia PostgreSQL: Transforma el JSONB a Array PHP automáticamente
            'birth_date' => 'date',
            'is_verified' => 'boolean',
        ];
    }

    // ==========================================
    // 🔗 RELACIONES DIRECTAS
    // ==========================================

    public function settings(): HasOne
    {
        return $this->hasOne(UserSetting::class);
    }

    public function statistics(): HasOne
    {
        return $this->hasOne(UserStatistic::class);
    }

    public function posts(): HasMany
    {
        return $this->hasMany(Post::class);
    }

    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }

    public function followers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'follows', 'following_id', 'follower_id');
    }

    public function following(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'follows', 'follower_id', 'following_id');
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    // ==========================================
    // 🔥 RELACIONES HACIA TABLAS POLIMÓRFICAS
    // (Un usuario CREA comentarios, reacciones y guarda cosas)
    // ==========================================

    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class);
    }

    public function reactions(): HasMany
    {
        return $this->hasMany(Reaction::class);
    }

    public function savedItems(): HasMany
    {
        return $this->hasMany(SavedItem::class);
    }

    // ==========================================
    // 🎯 ELOQUENT SCOPES (Filtros Reutilizables)
    // ==========================================

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeOfType($query, $type)
    {
        return $query->where('user_type', $type);
    }

    // 🔥 Scope Optimizador: Ideal para APIs de búsqueda (Buscador Superior del Frontend)
    public function scopeSearch($query, $term)
    {
        return $query->where(function ($q) use ($term) {
            $q->where('name', 'ilike', "%{$term}%") // 'ilike' es específico de Postgres para Case-Insensitive
              ->orWhere('username', 'ilike', "%{$term}%");
        });
    }
}