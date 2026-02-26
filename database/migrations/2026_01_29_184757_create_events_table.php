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
    Schema::create('events', function (Blueprint $table) {
        $table->id();
        
        // Relaciones
        $table->foreignId('post_id')->unique()->constrained()->onDelete('cascade');
        $table->foreignId('location_id')->nullable()->constrained()->onDelete('set null');
        $table->foreignId('organizer_id')->constrained('users')->onDelete('cascade');

        // Fechas y Horas
        $table->timestamp('start_date');
        $table->timestamp('end_date');

        // Detalles económicos y de aforo
        $table->decimal('price', 10, 2)->default(0.00);
        $table->integer('max_capacity')->nullable();
        $table->integer('available_slots')->nullable();
        $table->boolean('requires_rsvp')->default(false);

        // Estados y tipos
        $table->string('event_type', 30)->default('free');
        $table->string('event_status', 30)->default('scheduled');

        $table->timestamps();
    });

    // REGLAS DE ORO (PostgreSQL)
    // 1. Tipos de evento
    DB::statement("ALTER TABLE events ADD CONSTRAINT chk_event_type CHECK (event_type IN ('free', 'paid', 'donation'))");
    
    // 2. Estados del evento
    DB::statement("ALTER TABLE events ADD CONSTRAINT chk_event_status CHECK (event_status IN ('scheduled', 'ongoing', 'completed', 'cancelled'))");
    
    // 3. Lógica temporal: No puedes terminar antes de empezar
    DB::statement("ALTER TABLE events ADD CONSTRAINT chk_event_dates CHECK (end_date >= start_date)");
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('events');
    }
};
