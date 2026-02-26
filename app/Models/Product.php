<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'post_id', 
        'user_id', 
        'sku', 
        'price', 
        'stock', 
        'condition', 
        'is_active'
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'stock' => 'integer',
        'is_active' => 'boolean',
    ];

    // --- RELACIONES ---

    /** El Post que sirve como vitrina publicitaria de este producto */
    public function post(): BelongsTo
    {
        return $this->belongsTo(Post::class);
    }

    /** El artesano/vendedor dueño del producto */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** El producto puede aparecer en muchos detalles de órdenes de compra */
    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }
}