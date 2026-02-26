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
    Schema::create('locations', function (Blueprint $table) {
        $table->id();
        $table->string('name', 150);
        $table->string('address', 255);
        $table->string('neighborhood', 100)->nullable();
        $table->string('city', 100)->default('Popayán');
        
        // Coordenadas GPS con precisión decimal
        $table->decimal('latitude', 10, 8)->nullable();
        $table->decimal('longitude', 11, 8)->nullable();
        
        $table->string('location_type', 50);
        $table->string('phone', 20)->nullable();
        $table->string('opening_hours', 200)->nullable();
        $table->text('description')->nullable();
        $table->string('photo', 255)->nullable();
        $table->string('website', 255)->nullable();
        $table->integer('capacity')->nullable();
        $table->boolean('is_accessible')->default(true);
        
        $table->timestamps();
    });

    // Aplicamos el CHECK nativo de PostgreSQL para los tipos de lugar
    DB::statement("ALTER TABLE locations ADD CONSTRAINT chk_location_type CHECK (location_type IN ('museum', 'theater', 'gallery', 'street', 'park', 'cultural_center', 'auditorium', 'library', 'educational_center'))");
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('locations');
    }
};
