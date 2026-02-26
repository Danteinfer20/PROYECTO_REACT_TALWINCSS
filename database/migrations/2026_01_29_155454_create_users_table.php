<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB; // Necesario para los CHECK constraints

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name', 150);
            $table->string('username', 50)->unique();
            $table->string('email', 100)->unique();
            $table->string('password');
            
            // Usamos string para aplicar el CHECK de Postgres después
            $table->string('user_type', 30)->default('visitor');
            
            $table->date('birth_date')->nullable();
            $table->string('gender', 20)->nullable();
            $table->string('phone', 20)->nullable();
            $table->string('city', 100)->default('Popayán');
            $table->string('neighborhood', 100)->nullable();
            $table->text('bio')->nullable();
            $table->string('profile_picture')->nullable();
            $table->string('cover_picture')->nullable();
            $table->string('website')->nullable();
            
            // JSONB para manejo eficiente de redes sociales en Postgres
            $table->jsonb('social_media')->nullable(); 
            
            $table->timestamp('email_verified_at')->nullable();
            $table->timestamp('last_login_at')->nullable();
            
            $table->string('status', 20)->default('active');
            $table->boolean('is_verified')->default(false);
            $table->rememberToken();
            $table->timestamps();

            // Índices para optimizar búsquedas frecuentes
            $table->index('user_type');
            $table->index('status');
            $table->index('city');
        });

        // REGLAS DE INTEGRIDAD (Directo en PostgreSQL)
        // 1. Validar tipos de usuario permitidos
        DB::statement("ALTER TABLE users ADD CONSTRAINT chk_user_type CHECK (user_type IN ('artist', 'cultural_manager', 'visitor', 'admin', 'educator'))");
        
        // 2. Validar estados permitidos
        DB::statement("ALTER TABLE users ADD CONSTRAINT chk_status CHECK (status IN ('active', 'suspended', 'inactive'))");
        
        // 3. Regla de negocio: Mínimo 13 años de edad
        DB::statement("ALTER TABLE users ADD CONSTRAINT chk_age CHECK (birth_date <= CURRENT_DATE - INTERVAL '13 years')");
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};