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
    Schema::create('follows', function (Blueprint $table) {
        $table->id();
        
        // El que sigue (Seguidor)
        $table->foreignId('follower_id')->constrained('users')->onDelete('cascade');
        
        // El que es seguido (Artista/Gestor)
        $table->foreignId('following_id')->constrained('users')->onDelete('cascade');
        
        $table->boolean('notifications_enabled')->default(true);
        $table->timestamp('created_at')->useCurrent();

        // REGLAS DE ORO DE TU SQL
        $table->unique(['follower_id', 'following_id']);
    });

    // RESTRICCIÓN: No puedes seguirte a ti mismo (Lógica ADSO)
    DB::statement("ALTER TABLE follows ADD CONSTRAINT chk_no_self_follow CHECK (follower_id != following_id)");
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('follows');
    }
};
