<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    use HasFactory;

    // ¡LA LISTA ACTUALIZADA! Sin esto, Laravel guarda un producto en blanco
    protected $fillable = [
        'user_id', 
        'category_id', 
        'name', 
        'description', 
        'price', 
        'sale_price',
        'stock_quantity', 
        'product_type', 
        'dimensions',
        'materials',
        'weight_kg',
        'main_image', 
        'status',
        'is_featured'
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'sale_price' => 'decimal:2',
        'stock_quantity' => 'integer',
        'is_featured' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }
}