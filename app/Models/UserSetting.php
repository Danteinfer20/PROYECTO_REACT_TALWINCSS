<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserSetting extends Model
{
    use HasFactory;

    /** Campos que se pueden llenar masivamente */
    protected $fillable = [
        'user_id',
        'email_notifications',
        'push_notifications',
        'new_followers_notify',
        'comments_notify',
        'nearby_events_notify',
        'public_profile',
        'language',
        'theme'
    ];

    /** Conversión de tipos (Casting) */
    protected $casts = [
        'email_notifications' => 'boolean',
        'push_notifications' => 'boolean',
        'new_followers_notify' => 'boolean',
        'comments_notify' => 'boolean',
        'nearby_events_notify' => 'boolean',
        'public_profile' => 'boolean',
    ];

    // --- RELACIONES ---

    /** Relación inversa: Los ajustes pertenecen a un Usuario */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}