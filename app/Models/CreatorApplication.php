<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CreatorApplication extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'proposed_type',
        'portfolio_url',
        'evidence_file',
        'message',
        'status',
        'rejection_reason',
        'reviewed_by',
        'reviewed_at'
    ];

    protected $casts = [
        'reviewed_at' => 'datetime',
    ];

    // ==========================================
    // 🔗 RELACIONES
    // ==========================================
    
    // El usuario que envía la solicitud
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // El administrador que la revisó
    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    // ==========================================
    // 🎯 SCOPES (Filtros Rápidos)
    // ==========================================

    // Uso: CreatorApplication::pending()->get();
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    // Uso: CreatorApplication::approved()->get();
    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }
    
    // Uso: CreatorApplication::rejected()->get();
    public function scopeRejected($query)
    {
        return $query->where('status', 'rejected');
    }
}