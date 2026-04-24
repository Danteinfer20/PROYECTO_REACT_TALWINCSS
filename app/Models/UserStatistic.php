<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserStatistic extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'post_count', 'follower_count', 'following_count', 
        'event_count', 'attendance_count', 'average_rating', 
        'sales_count', 'total_revenue', 'educational_content_count'
    ];

    protected function casts(): array
    {
        return [
            'post_count' => 'integer',
            'follower_count' => 'integer',
            'following_count' => 'integer',
            'event_count' => 'integer',
            'attendance_count' => 'integer',
            'average_rating' => 'decimal:2',
            'sales_count' => 'integer',
            'total_revenue' => 'decimal:2',
            'educational_content_count' => 'integer',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}