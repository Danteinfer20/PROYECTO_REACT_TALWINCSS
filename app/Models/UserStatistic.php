<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserStatistic extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 
        'total_posts', 
        'total_followers', 
        'total_following', 
        'total_likes_received', 
        'total_sales', 
        'reputation_score'
    ];

    protected $casts = [
        'total_posts' => 'integer',
        'total_followers' => 'integer',
        'total_following' => 'integer',
        'total_likes_received' => 'integer',
        'total_sales' => 'integer',
        'reputation_score' => 'decimal:2',
    ];

    // --- RELACIONES ---

    /** Estas estadísticas pertenecen a un usuario único */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}