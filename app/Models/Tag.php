<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Tag extends Model
{
    use HasFactory;

    protected $fillable = [
        'name', 
        'slug', 
        'tag_type', 
        'usage_count'
    ];

    protected $casts = [
        'usage_count' => 'integer',
    ];

    // --- RELACIONES ---

    /** Relación Muchos a Muchos: Un Tag puede estar en muchos Posts */
    public function posts(): BelongsToMany
    {
        return $this->belongsToMany(Post::class, 'post_tags');
    }
}