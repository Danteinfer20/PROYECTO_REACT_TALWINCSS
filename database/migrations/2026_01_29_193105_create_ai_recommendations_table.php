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
    Schema::create('ai_recommendations', function (Blueprint $table) {
        $table->id();
        
        // A quién le recomendamos
        $table->foreignId('user_id')->constrained()->onDelete('cascade');
        
        // Qué le recomendamos
        $table->foreignId('recommended_post_id')->constrained('posts')->onDelete('cascade');
        
        $table->string('recommendation_type', 50); // cultural, educational, etc.
        
        // Qué tan segura está la IA de que esto le gustará (0.00 a 1.00)
        $table->decimal('confidence_score', 3, 2);
        
        // El "Por qué" (Ej: "Porque te gusta el teatro")
        $table->text('reason')->nullable();

        $table->timestamp('created_at')->useCurrent();
    });

    // CHECK de tipos de recomendación
    DB::statement("ALTER TABLE ai_recommendations ADD CONSTRAINT chk_rec_type 
        CHECK (recommendation_type IN ('cultural', 'educational', 'event', 'product'))");
}
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ai_recommendations');
    }
};
