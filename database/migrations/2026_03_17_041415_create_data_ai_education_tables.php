<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Tabla: USER_STATISTICS (Caché de contadores para no saturar la DB con COUNTs)
        Schema::create('user_statistics', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained('users')->cascadeOnDelete();
            $table->integer('post_count')->default(0);
            $table->integer('follower_count')->default(0);
            $table->integer('following_count')->default(0);
            $table->integer('event_count')->default(0);
            $table->integer('attendance_count')->default(0);
            $table->decimal('average_rating', 3, 2)->default(0.00);
            $table->integer('sales_count')->default(0);
            $table->decimal('total_revenue', 12, 2)->default(0.00);
            $table->integer('educational_content_count')->default(0);
            $table->timestamps();
        });

        // 2. Tabla: ACTIVITY_LOGS (Auditoría de seguridad y analítica)
        Schema::create('activity_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('action', 100);
            $table->text('description')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->jsonb('properties')->nullable(); // Guardará metadatos del evento en JSON
            $table->timestamps();
        });

        // 3. Tabla: EDUCATIONAL_CONTENT (El módulo de pedagogía)
        Schema::create('educational_content', function (Blueprint $table) {
            $table->id();
            $table->foreignId('post_id')->unique()->constrained('posts')->cascadeOnDelete();
            $table->enum('difficulty_level', ['beginner', 'intermediate', 'advanced'])->default('beginner');
            $table->integer('estimated_read_time')->nullable(); // En minutos
            $table->jsonb('learning_objectives')->nullable();
            $table->jsonb('related_topics')->nullable();
            $table->boolean('ai_generated')->default(false);
            $table->string('knowledge_area', 100)->nullable();
            $table->string('historical_period', 100)->nullable();
            $table->text('cultural_significance')->nullable();
            $table->timestamps();
        });

        // 4. Tabla: AI_RECOMMENDATIONS (Motor de sugerencias personalizadas)
        Schema::create('ai_recommendations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            // Refiere a la tabla 'posts' (puede ser arte, eventos o productos)
            $table->foreignId('recommended_post_id')->constrained('posts')->cascadeOnDelete();
            $table->enum('recommendation_type', ['cultural', 'educational', 'event', 'product'])->nullable();
            $table->decimal('confidence_score', 3, 2)->nullable(); // Ej: 0.95 (95% de coincidencia)
            $table->text('reason')->nullable(); // Explicación de la IA del por qué se recomienda
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ai_recommendations');
        Schema::dropIfExists('educational_content');
        Schema::dropIfExists('activity_logs');
        Schema::dropIfExists('user_statistics');
    }
};