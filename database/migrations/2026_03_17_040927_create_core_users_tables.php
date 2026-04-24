<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Tabla: USERS
        Schema::create('users', function (Blueprint $table) {
            $table->id(); // BIGSERIAL automático
            $table->string('name', 150);
            $table->string('username', 50)->unique();
            $table->string('email', 100)->unique();
            $table->string('password');
            $table->enum('user_type', ['artist', 'cultural_manager', 'visitor', 'admin', 'educator'])->default('visitor');
            $table->date('birth_date')->nullable();
            $table->string('gender', 20)->nullable();
            $table->string('phone', 20)->nullable();
            $table->string('city', 100)->default('Popayán');
            $table->string('neighborhood', 100)->nullable();
            $table->text('bio')->nullable();
            $table->string('profile_picture')->nullable();
            $table->string('cover_picture')->nullable();
            $table->string('website')->nullable();
            $table->jsonb('social_media')->nullable();
            $table->timestamp('email_verified_at')->nullable();
            $table->timestamp('last_login_at')->nullable();
            $table->enum('status', ['active', 'suspended', 'inactive'])->default('active');
            $table->boolean('is_verified')->default(false);
            $table->rememberToken();
            $table->timestamps();
            $table->softDeletes(); // Para no borrar datos financieros/auditoría
        });

        // 2. Tabla: PASSWORD RESET TOKENS
        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email', 100)->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        // 3. Tabla: USER SETTINGS
        Schema::create('user_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained('users')->cascadeOnDelete();
            $table->boolean('email_notifications')->default(true);
            $table->boolean('push_notifications')->default(true);
            $table->boolean('new_followers_notify')->default(true);
            $table->boolean('comments_notify')->default(true);
            $table->boolean('nearby_events_notify')->default(true);
            $table->boolean('public_profile')->default(true);
            $table->string('language', 10)->default('es');
            $table->enum('theme', ['light', 'dark', 'auto'])->default('light');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_settings');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('users');
    }
};