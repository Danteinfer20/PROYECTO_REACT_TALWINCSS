<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Tag extends Model
{
    use HasFactory;

    protected $fillable = [
        'name', 'slug', 'tag_type', 'usage_count'
    ];

    protected function casts(): array
    {
        return [
            'usage_count' => 'integer',
        ];
    }

    public function posts(): BelongsToMany
    {
        return $this->belongsToMany(Post::class, 'post_tags');
    }

    // 🎯 SCOPES
    public function scopeOfType($query, $type)
    {
        return $query->where('tag_type', $type);
    }

    public function scopePopular($query)
    {
        return $query->orderBy('usage_count', 'desc');
    }
}