<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB; // Necesario para el CHECK constraint

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_settings', function (Blueprint $table) {
            $table->id();

            // Llave Foránea 1:1 con Users
            // El método unique() es CRUCIAL para que sea una relación 1 a 1
            $table->foreignId('user_id')
                  ->unique() 
                  ->constrained('users')
                  ->onDelete('cascade');

            // Preferencias de Notificación
            $table->boolean('email_notifications')->default(true);
            $table->boolean('push_notifications')->default(true);
            $table->boolean('new_followers_notify')->default(true);
            $table->boolean('comments_notify')->default(true);
            $table->boolean('nearby_events_notify')->default(true);
            
            // Privacidad y Apariencia
            $table->boolean('public_profile')->default(true);
            $table->string('language', 10)->default('es');
            $table->string('theme', 20)->default('light');

            $table->timestamps(); // Maneja created_at y updated_at
        });

        // Aplicamos el CHECK de PostgreSQL para el tema
        DB::statement("ALTER TABLE user_settings ADD CONSTRAINT chk_theme CHECK (theme IN ('light', 'dark', 'auto'))");
    }

    public function down(): void
    {
        Schema::dropIfExists('user_settings');
    }
};