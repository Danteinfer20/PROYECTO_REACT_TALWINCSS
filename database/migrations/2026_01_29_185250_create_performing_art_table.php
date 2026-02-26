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
    Schema::create('performing_arts', function (Blueprint $table) {
        $table->id();
        
        // Relación con el Evento
        $table->foreignId('event_id')->constrained()->onDelete('cascade');
        
        $table->string('art_type', 30); // teatro, danza, etc.
        $table->integer('duration_minutes')->nullable();
        $table->string('artistic_director', 150)->nullable();
        $table->string('company', 150)->nullable(); // Grupo o compañía
        $table->string('genre', 100)->nullable();
        $table->string('target_audience', 50)->nullable(); // Todo público, adultos, etc.
        
        $table->text('technical_requirements')->nullable(); // Luces, sonido, etc.
        
        // JSONB para guardar el elenco de forma flexible
        $table->jsonb('cast_members')->nullable(); 

        $table->timestamp('created_at')->useCurrent();
    });

    // Check para validar los tipos de artes escénicas
    DB::statement("ALTER TABLE performing_arts ADD CONSTRAINT chk_art_type CHECK (art_type IN ('circus', 'theater', 'dance', 'performance', 'magic', 'music', 'storytelling'))");
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('performing_art');
    }
};
