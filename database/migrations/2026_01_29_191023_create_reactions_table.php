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
    Schema::create('reactions', function (Blueprint $table) {
        $table->id();
        
        // Relaciones
        $table->foreignId('post_id')->constrained()->onDelete('cascade');
        $table->foreignId('user_id')->constrained()->onDelete('cascade');
        
        // Tipo de reacción (like, love, inspire, interest)
        $table->string('reaction_type', 30);
        
        $table->timestamp('created_at')->useCurrent();

        // REGLA: Un usuario solo puede tener UNA reacción por post
        $table->unique(['post_id', 'user_id']);
    });

    // Aplicamos el CHECK de tu SQL
    DB::statement("ALTER TABLE reactions ADD CONSTRAINT chk_reaction_type CHECK (reaction_type IN ('like', 'love', 'inspire', 'interest'))");
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reactions');
    }
};
