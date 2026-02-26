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
    Schema::create('orders', function (Blueprint $table) {
        $table->id();
        
        // El cliente que compra
        $table->foreignId('user_id')->constrained()->onDelete('cascade');
        
        // Número de pedido único (ej: ORD-2026-001)
        $table->string('order_number', 50)->unique();
        
        $table->decimal('total_amount', 12, 2);
        $table->string('status', 30)->default('pending');
        
        $table->string('payment_method', 30)->nullable();
        $table->text('shipping_address')->nullable();
        $table->string('contact_phone', 20)->nullable();
        $table->text('notes')->nullable(); // Instrucciones especiales de entrega

        $table->timestamps();
    });

    // Restricción de estados según tu SQL
    DB::statement("ALTER TABLE orders ADD CONSTRAINT chk_order_status 
        CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled'))");
}
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
