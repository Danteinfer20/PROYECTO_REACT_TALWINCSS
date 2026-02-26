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
    Schema::create('order_items', function (Blueprint $table) {
        $table->id();
        
        // Relación con la Orden (Si se borra la orden, se borran sus items)
        $table->foreignId('order_id')->constrained()->onDelete('cascade');
        
        // Relación con el Producto (RESTRICT: No permite borrar el producto si alguien lo compró)
        $table->foreignId('product_id')->constrained()->onDelete('restrict');
        
        $table->integer('quantity'); // Cuántas unidades compró
        $table->decimal('unit_price', 10, 2); // Precio al que lo compró (Histórico)
        $table->decimal('subtotal', 12, 2); // cantidad * unit_price

        $table->timestamp('created_at')->useCurrent();
    });

    // Validación de que la cantidad siempre sea mayor a 0
    DB::statement("ALTER TABLE order_items ADD CONSTRAINT chk_quantity_positive CHECK (quantity > 0)");
}
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_items');
    }
};
