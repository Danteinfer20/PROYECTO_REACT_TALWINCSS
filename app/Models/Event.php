<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Event extends Model
{
    use HasFactory;

    protected $fillable = [
        'post_id', 'location_id', 'organizer_id', 
        'start_date', 'end_date', 'price', 
        'max_capacity', 'available_slots', 
        'requires_rsvp', 'event_type', 'event_status'
    ];

    protected $casts = [
        'start_date' => 'datetime',
        'end_date' => 'datetime',
        'price' => 'decimal:2',
        'requires_rsvp' => 'boolean',
        'max_capacity' => 'integer',
        'available_slots' => 'integer',
    ];

    // --- RELACIONES ---

    /** El Post que contiene la descripción de este evento */
    public function post(): BelongsTo
    {
        return $this->belongsTo(Post::class);
    }

    /** Dónde se realizará el evento */
    public function location(): BelongsTo
    {
        return $this->belongsTo(Location::class);
    }

    /** El usuario que organiza el evento */
    public function organizer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'organizer_id');
    }

    /** Si es un evento de artes escénicas, tiene detalles extra */
    public function performingArt(): HasOne
    {
        return $this->hasOne(PerformingArt::class);
    }

    /** Lista de personas inscritas o interesadas */
    public function attendances(): HasMany
    {
        return $this->hasMany(EventAttendance::class);
    }
}