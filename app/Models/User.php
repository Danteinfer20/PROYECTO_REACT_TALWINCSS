<?php

namespace App\Models;

use Laravel\Sanctum\HasApiTokens; // <-- 1. AÑADIDO: Importación para tokens
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class User extends Authenticatable
{
    // 2. AÑADIDO: Incluimos HasApiTokens en la lista de "use"
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * Campos que se pueden llenar masivamente
     */
    protected $fillable = [
        'name', 'username', 'email', 'password', 'user_type', 
        'birth_date', 'gender', 'phone', 'city', 'neighborhood', 
        'bio', 'profile_picture', 'cover_picture', 'website', 
        'social_media', 'status', 'is_verified'
    ];

    /**
     * Campos ocultos (seguridad)
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Conversión de tipos (Casting)
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'social_media' => 'array', 
        'birth_date' => 'date',
        'is_verified' => 'boolean',
    ];

    // --- RELACIONES ---

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

    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class);
    }

    public function customNotifications(): HasMany
    {
        return $this->hasMany(Notification::class);
    }

    public function savedItems(): HasMany
    {
        return $this->hasMany(SavedItem::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function activityLogs(): HasMany
    {
        return $this->hasMany(ActivityLog::class);
    }
    
    public function eventAttendances(): HasMany
    {
        return $this->hasMany(EventAttendance::class);
    }
}