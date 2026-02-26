<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 
        'total_amount', 
        'status', 
        'payment_status', 
        'payment_method', 
        'shipping_address', 
        'notes'
    ];

    protected $casts = [
        'total_amount' => 'decimal:2',
    ];

    // --- RELACIONES ---

    /** El cliente que realizó la compra */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** Los productos específicos que se compraron en esta orden */
    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }
}