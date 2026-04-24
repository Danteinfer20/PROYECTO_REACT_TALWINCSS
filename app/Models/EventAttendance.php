<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EventAttendance extends Model
{
    use HasFactory;

    // 🔥 CORRECCIÓN ARQUITECTÓNICA CRÍTICA:
    // Forzamos el nombre exacto en singular tal cual está en la base de datos
    protected $table = 'event_attendance';

    protected $fillable = [
        'event_id', 'user_id', 'status', 'guest_count', 
        'qr_code', 'checked_in', 'checked_in_at'
    ];

    // 🔥 Siempre trae quién va a asistir
    protected $with = ['user']; 

    protected function casts(): array
    {
        return [
            'guest_count' => 'integer',
            'checked_in' => 'boolean',
            'checked_in_at' => 'datetime',
        ];
    }

    // ==========================================
    // 🔗 RELACIONES DIRECTAS
    // ==========================================
    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // ==========================================
    // 🎯 SCOPES
    // ==========================================
    public function scopeConfirmed($query)
    {
        return $query->where('status', 'confirmed');
    }
}