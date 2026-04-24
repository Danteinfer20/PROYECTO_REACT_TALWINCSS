<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('creator_applications', function (Blueprint $table) {
            $table->id();
            
            // Quién hace la solicitud
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            
            // Qué rango está solicitando (artist, cultural_manager, educator)
            $table->string('proposed_type')->default('artist'); 
            
            // La evidencia
            $table->string('portfolio_url')->nullable(); // Link a Instagram, Behance, etc.
            $table->string('evidence_file')->nullable(); // Ruta del PDF o Imagen del certificado
            $table->text('message'); // Carta de motivación o descripción de trayectoria
            
            // Estado del trámite
            $table->string('status')->default('pending'); // pending, approved, rejected
            
            // Auditoría (Qué administrador lo revisó y cuándo)
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('creator_applications');
    }
};