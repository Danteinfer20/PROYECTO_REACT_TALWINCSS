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
    Schema::create('products', function (Blueprint $table) {
        $table->id();
        
        // Relaciones
        $table->foreignId('user_id')->constrained()->onDelete('cascade');
        $table->foreignId('category_id')->nullable()->constrained()->onDelete('set null');
        
        $table->string('name', 200);
        $table->text('description');
        
        // Dinero y Stock
        $table->decimal('price', 10, 2);
        $table->decimal('sale_price', 10, 2)->nullable(); // Precio de oferta
        $table->integer('stock_quantity')->default(0);
        
        // Detalles Técnicos
        $table->string('product_type', 30); // physical, digital, etc.
        $table->string('dimensions', 100)->nullable();
        $table->string('materials', 200)->nullable();
        $table->decimal('weight_kg', 6, 2)->nullable();
        
        $table->string('main_image', 255)->nullable();
        $table->string('status', 20)->default('available');
        $table->boolean('is_featured')->default(false);
        $table->integer('sales_count')->default(0);

        $table->timestamps();
    });

    // Restricciones de tu SQL
    DB::statement("ALTER TABLE products ADD CONSTRAINT chk_product_type 
        CHECK (product_type IN ('physical', 'digital', 'service', 'handicraft'))");
        
    DB::statement("ALTER TABLE products ADD CONSTRAINT chk_product_status 
        CHECK (status IN ('available', 'sold_out', 'paused'))");
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
