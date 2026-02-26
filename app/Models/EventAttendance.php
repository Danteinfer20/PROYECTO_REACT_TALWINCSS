<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EventAttendance extends Model
{
    use HasFactory;

    // Nota: El nombre de la tabla suele ser plural, pero si tu migración 
    // fue 'event_attendance', Laravel la encontrará.
    protected $table = 'event_attendance';

    protected $fillable = [
        'event_id', 'user_id', 'status', 
        'guest_count', 'qr_code', 
        'checked_in', 'checked_in_at'
    ];

    protected $casts = [
        'guest_count' => 'integer',
        'checked_in' => 'boolean',
        'checked_in_at' => 'datetime',
    ];

    // --- RELACIONES ---

    /** A qué evento se inscribió */
    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    /** Qué usuario se inscribió */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}