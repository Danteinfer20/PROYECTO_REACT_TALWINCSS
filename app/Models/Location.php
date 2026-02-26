<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Location extends Model
{
    use HasFactory;

    protected $fillable = [
        'name', 'address', 'neighborhood', 'city',
        'latitude', 'longitude', 'location_type',
        'phone', 'opening_hours', 'description',
        'photo', 'website', 'capacity', 'is_accessible'
    ];

    protected $casts = [
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
        'capacity' => 'integer',
        'is_accessible' => 'boolean',
    ];

    // --- RELACIONES ---

    /** Una ubicación puede albergar muchos eventos */
    public function events(): HasMany
    {
        return $this->hasMany(Event::class);
    }
}