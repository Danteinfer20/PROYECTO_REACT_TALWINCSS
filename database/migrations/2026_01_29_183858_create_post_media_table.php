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
    Schema::create('post_media', function (Blueprint $table) {
        $table->id();
        
        // Relación con el Post (Si el post muere, sus fotos también)
        $table->foreignId('post_id')->constrained()->onDelete('cascade');
        
        $table->string('file_type', 20); // image, video, audio, document
        $table->string('file_path', 500); // Ruta en el servidor o S3
        $table->string('file_name', 255); // Nombre original del archivo
        
        $table->integer('file_size')->nullable(); // En bytes o KB
        $table->integer('sort_order')->default(0); // Para ordenar la galería
        $table->string('alt_text', 200)->nullable(); // Accesibilidad SEO
        
        $table->boolean('is_cover')->default(false); // ¿Es la imagen principal?

        $table->timestamp('created_at')->useCurrent();
    });

    // Check para asegurar que solo suban formatos permitidos
    DB::statement("ALTER TABLE post_media ADD CONSTRAINT chk_file_type CHECK (file_type IN ('image', 'video', 'audio', 'document'))");
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('post_media');
    }
};
