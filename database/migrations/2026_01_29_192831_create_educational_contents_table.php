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
    Schema::create('educational_content', function (Blueprint $table) {
        $table->id();
        
        // Relación con el Post (1 a 1)
        $table->foreignId('post_id')->unique()->constrained()->onDelete('cascade');
        
        $table->string('difficulty_level', 20)->default('beginner');
        $table->integer('estimated_read_time')->nullable(); // En minutos
        
        // Datos enriquecidos (JSONB)
        $table->jsonb('learning_objectives')->nullable(); // Objetivos de aprendizaje
        $table->jsonb('related_topics')->nullable(); // Temas relacionados
        
        $table->boolean('ai_generated')->default(false); // ¿Lo escribió una IA?
        $table->string('knowledge_area', 100)->nullable(); // Ej: Historia del Arte
        $table->string('historical_period', 100)->nullable(); // Ej: Siglo XVIII
        $table->text('cultural_significance')->nullable();

        $table->timestamp('created_at')->useCurrent();
    });

    // Restricción de niveles según tu SQL
    DB::statement("ALTER TABLE educational_content ADD CONSTRAINT chk_difficulty_level 
        CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced'))");
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('educational_contents');
    }
};
