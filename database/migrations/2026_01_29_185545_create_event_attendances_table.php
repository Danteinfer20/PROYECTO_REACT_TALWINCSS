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
    Schema::create('event_attendance', function (Blueprint $table) {
        $table->id();
        
        // Relaciones
        $table->foreignId('event_id')->constrained()->onDelete('cascade');
        $table->foreignId('user_id')->constrained()->onDelete('cascade');
        
        // Estado de asistencia
        $table->string('status', 30)->default('interested');
        $table->integer('guest_count')->default(0);
        
        // Control de acceso (QR)
        $table->string('qr_code', 100)->unique()->nullable();
        $table->boolean('checked_in')->default(false);
        $table->timestamp('checked_in_at')->nullable();

        $table->timestamps();

        // Evitar duplicados: Un usuario solo se registra una vez por evento
        $table->unique(['event_id', 'user_id']);
    });

    // Restricción de estados permitidos
    DB::statement("ALTER TABLE event_attendance ADD CONSTRAINT chk_attendance_status CHECK (status IN ('confirmed', 'interested', 'not_attending', 'attended'))");
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('event_attendances');
    }
};
