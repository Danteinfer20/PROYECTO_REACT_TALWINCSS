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
    Schema::create('saved_items', function (Blueprint $table) {
        $table->id();
        
        // Relaciones
        $table->foreignId('user_id')->constrained()->onDelete('cascade');
        $table->foreignId('post_id')->constrained()->onDelete('cascade');
        
        // Categoría del guardado (Tu SQL usa un CHECK)
        $table->string('category', 30)->default('favorites');
        
        $table->timestamp('created_at')->useCurrent();

        // REGLA: Un usuario no puede guardar el mismo post dos veces en la tabla
        $table->unique(['user_id', 'post_id']);
    });

    // Aplicamos la restricción CHECK de tu SQL
    DB::statement("ALTER TABLE saved_items ADD CONSTRAINT chk_saved_category CHECK (category IN ('read_later', 'favorites', 'inspiration', 'educational'))");
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('saved_items');
    }
};
