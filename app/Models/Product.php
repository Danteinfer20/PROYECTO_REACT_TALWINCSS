<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes; // 🔥 Agregado
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany; // 🔥 Para Polimorfismo

class Product extends Model
{
    use HasFactory, SoftDeletes; // 🔥 Activamos SoftDeletes

    protected $fillable = [
        'user_id', 'category_id', 'name', 'description', 
        'price', 'sale_price', 'stock_quantity', 'product_type', 
        'dimensions', 'materials', 'weight_kg', 'main_image', 
        'status', 'is_featured', 'sales_count'
    ];

    // 🔥 Eager Loading por defecto: 
    // Siempre que pidas un Producto, traerá al usuario(artesano) y la categoría. Evita N+1 queries.
    protected $with = ['user', 'category'];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'sale_price' => 'decimal:2',
            'stock_quantity' => 'integer',
            'is_featured' => 'boolean',
            'sales_count' => 'integer',
            'weight_kg' => 'decimal:2',
        ];
    }

    protected $appends = ['gallery'];

    public function getGalleryAttribute()
    {
        $images = $this->productImages()->pluck('image_path')->toArray();
        if (count($images) > 0) {
            return $images;
        }
        return [$this->main_image, $this->main_image, $this->main_image];
    }

    // ==========================================
    // 🔗 RELACIONES DIRECTAS
    // ==========================================

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

    public function productImages(): HasMany
    {
        return $this->hasMany(ProductImage::class);
    }

    // ==========================================
    // 🔥 RELACIONES POLIMÓRFICAS (RECIBE Interacciones)
    // ==========================================

    // Ahora puedes hacer: $product->comments()->get();
    public function comments(): MorphMany
    {
        return $this->morphMany(Comment::class, 'commentable');
    }

    // Ahora puedes hacer: $product->reactions()->get();
    public function reactions(): MorphMany
    {
        return $this->morphMany(Reaction::class, 'reactable');
    }

    // ==========================================
    // 🎯 ELOQUENT SCOPES
    // ==========================================

    // Usar en controlador: Product::available()->get();
    public function scopeAvailable($query)
    {
        return $query->where('status', 'available')->where('stock_quantity', '>', 0);
    }

    // Usar en controlador: Product::featured()->get();
    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }
}