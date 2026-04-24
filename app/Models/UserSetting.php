<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'email_notifications', 'push_notifications', 
        'new_followers_notify', 'comments_notify', 'nearby_events_notify', 
        'public_profile', 'language', 'theme'
    ];

    protected function casts(): array
    {
        return [
            'email_notifications' => 'boolean',
            'push_notifications' => 'boolean',
            'new_followers_notify' => 'boolean',
            'comments_notify' => 'boolean',
            'nearby_events_notify' => 'boolean',
            'public_profile' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}