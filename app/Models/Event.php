<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Event extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'post_id', 'location_id', 'organizer_id', 'start_date', 
        'end_date', 'price', 'max_capacity', 'available_slots', 
        'requires_rsvp', 'event_type', 'event_status'
    ];

    // 🔥 Carga automática del organizador y la locación
    protected $with = ['location', 'organizer'];

    protected function casts(): array
    {
        return [
            'start_date' => 'datetime',
            'end_date' => 'datetime',
            'price' => 'decimal:2',
            'max_capacity' => 'integer',
            'available_slots' => 'integer',
            'requires_rsvp' => 'boolean',
        ];
    }

    // ==========================================
    // 🔗 RELACIONES DIRECTAS
    // ==========================================
    public function post(): BelongsTo
    {
        return $this->belongsTo(Post::class);
    }

    public function location(): BelongsTo
    {
        return $this->belongsTo(Location::class);
    }

    // El organizador es un Usuario, pero la columna se llama organizer_id
    public function organizer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'organizer_id');
    }

    public function performingArts(): HasOne
    {
        return $this->hasOne(PerformingArt::class);
    }

    public function attendances(): HasMany
    {
        return $this->hasMany(EventAttendance::class);
    }

    // ==========================================
    // 🎯 ELOQUENT SCOPES
    // ==========================================
    
    // 🔥 Eventos futuros (Ideal para la Home de React)
    public function scopeUpcoming($query)
    {
        return $query->where('event_status', 'scheduled')
                     ->where('start_date', '>=', now())
                     ->orderBy('start_date', 'asc');
    }

    public function scopeOngoing($query)
    {
        return $query->where('event_status', 'ongoing');
    }
}