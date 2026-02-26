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
        // Corregido: Eliminamos la llave extra que sobraba aquí
        Schema::create('content_types', function (Blueprint $table) {
            $table->id(); 
            $table->string('name', 50)->unique();
            $table->text('description')->nullable();
            
            // Flags para lógica de negocio
            $table->boolean('allows_events')->default(false);
            $table->boolean('allows_education')->default(false);
            
            $table->string('icon', 255)->nullable();
            
            $table->timestamps(); 
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('content_types');
    }
};