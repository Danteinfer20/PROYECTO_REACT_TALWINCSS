<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    // 🔥 Mantenemos los traits de arquitectura
    use HasFactory, SoftDeletes, HasUuids;

    protected $fillable = [
        'user_id', 'order_number', 'total_amount', 'status', 
        'payment_method', 'shipping_address', 'contact_phone', 'notes'
    ];

    // Siempre carga al comprador por defecto
    protected $with = ['user'];

    protected function casts(): array
    {
        return [
            'total_amount' => 'decimal:2',
        ];
    }

    // ==========================================
    // 🛡️ CORRECCIÓN CRÍTICA DE ARQUITECTURA
    // ==========================================
    // Le decimos a Laravel explícitamente qué columna usa el UUID. 
    // Si no hacemos esto, intentará meter letras en el `id` (BIGSERIAL) y causará el Error 400.
    public function uniqueIds(): array
    {
        return ['uuid'];
    }

    // Usamos el UUID para las URLs (Seguridad P2P)
    public function getRouteKeyName(): string
    {
        return 'uuid';
    }

    // ==========================================
    // 🔗 RELACIONES DIRECTAS
    // ==========================================
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    // ==========================================
    // 🎯 SCOPES DE FINANZAS (Intactos y listos)
    // ==========================================
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'delivered');
    }
}