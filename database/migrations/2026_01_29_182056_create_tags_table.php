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
    Schema::create('tags', function (Blueprint $table) {
        $table->id();
        $table->string('name', 50)->unique();
        $table->string('slug', 60)->unique();
        
        // Tipo de etiqueta para segmentar (ej: técnicas vs lugares)
        $table->string('tag_type', 30)->default('general');
        
        $table->integer('usage_count')->default(0);
        
        $table->timestamps();
    });

    // Aplicamos el CHECK nativo de PostgreSQL
    DB::statement("ALTER TABLE tags ADD CONSTRAINT chk_tag_type CHECK (tag_type IN ('art', 'place', 'technique', 'era', 'general', 'educational'))");
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tags');
    }
};
