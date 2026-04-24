<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ContentType extends Model
{
    use HasFactory;

    protected $fillable = [
        'name', 'description', 'allows_events', 'allows_education', 'icon'
    ];

    protected function casts(): array
    {
        return [
            'allows_events' => 'boolean',
            'allows_education' => 'boolean',
        ];
    }

    public function posts(): HasMany
    {
        return $this->hasMany(Post::class);
    }

    // 🎯 SCOPES
    public function scopeForEvents($query)
    {
        return $query->where('allows_events', true);
    }

    public function scopeForEducation($query)
    {
        return $query->where('allows_education', true);
    }
}