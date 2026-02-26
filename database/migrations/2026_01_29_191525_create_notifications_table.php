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
    Schema::create('notifications', function (Blueprint $table) {
        $table->id();
        
        // El destinatario de la notificación
        $table->foreignId('user_id')->constrained()->onDelete('cascade');
        
        // Tipo de notificación (Categorías de tu SQL)
        $table->string('type', 50); 
        
        $table->string('title', 200);
        $table->text('message');
        
        // URL a donde llevará la notificación al hacer clic (ej: el link del post)
        $table->string('action_url', 255)->nullable();
        
        $table->boolean('is_read')->default(false);
        $table->timestamp('read_at')->nullable(); // Cuándo se leyó exactamente

        $table->timestamps();
    });

    // CHECK de tipos de notificación según tu SQL
    DB::statement("ALTER TABLE notifications ADD CONSTRAINT chk_notification_type 
        CHECK (type IN ('new_follower', 'comment', 'reaction', 'event_reminder', 'message', 'sale', 'system', 'educational'))");
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
