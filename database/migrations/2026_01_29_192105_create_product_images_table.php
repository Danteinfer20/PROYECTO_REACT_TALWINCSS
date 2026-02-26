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
    Schema::create('product_images', function (Blueprint $table) {
        $table->id();
        
        // Relación con el Producto
        $table->foreignId('product_id')->constrained()->onDelete('cascade');
        
        $table->string('image_path', 255);
        $table->integer('sort_order')->default(0); // Para decidir el orden en el slider
        $table->boolean('is_primary')->default(false); // La foto principal de la vitrina

        $table->timestamp('created_at')->useCurrent();
    });
}
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_images');
    }
};
