<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class SavedItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'savable_type', 'savable_id', 'user_id', 'category'
    ];

    // 🔥 Eager Loading Polimórfico: 
    // Cuando el usuario vea sus guardados, Laravel cargará el Post o Producto automáticamente
    protected $with = ['savable']; 

    // 🔥 Magia Polimórfica
    public function savable(): MorphTo
    {
        return $this->morphTo();
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // 🎯 SCOPES
    public function scopeCategory($query, $category)
    {
        return $query->where('category', $category);
    }
}