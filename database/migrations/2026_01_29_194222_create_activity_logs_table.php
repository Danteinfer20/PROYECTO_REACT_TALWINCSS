<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
{
    Schema::create('activity_logs', function (Blueprint $table) {
        $table->id();
        
        // Quién hizo la acción (Si se borra el usuario, mantenemos el log poniendo NULL)
        $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
        
        $table->string('action', 100); // login, update_product, delete_post
        $table->text('description')->nullable();
        
        // Datos técnicos de seguridad
        $table->string('ip_address', 45)->nullable();
        $table->text('user_agent')->nullable(); // Navegador y sistema operativo
        
        // Detalles extra en formato JSON
        $table->jsonb('properties')->nullable(); 

        $table->timestamp('created_at')->useCurrent();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('activity_logs');
    }
};
