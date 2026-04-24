<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Tabla: PRODUCTS (Artesanías y obras)
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('category_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name', 200);
            $table->text('description');
            $table->decimal('price', 10, 2);
            $table->decimal('sale_price', 10, 2)->nullable();
            $table->integer('stock_quantity')->default(0);
            $table->enum('product_type', ['physical', 'digital', 'service', 'handicraft']);
            $table->string('dimensions', 100)->nullable();
            $table->string('materials', 200)->nullable();
            $table->decimal('weight_kg', 6, 2)->nullable();
            $table->string('main_image')->nullable();
            $table->enum('status', ['available', 'sold_out', 'paused'])->default('available');
            $table->boolean('is_featured')->default(false);
            $table->integer('sales_count')->default(0);
            $table->timestamps();
            $table->softDeletes(); // Protege el catálogo de borrados accidentales
        });

        // 2. Tabla: PRODUCT_IMAGES (Galería de las piezas)
        Schema::create('product_images', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->string('image_path', 255);
            $table->integer('sort_order')->default(0);
            $table->boolean('is_primary')->default(false);
            $table->timestamps();
        });

        // 3. Tabla: ORDERS (Pedidos)
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            // Generamos un UUID seguro nativo en PostgreSQL para las URLs públicas (Ej: misitio.com/orders/550e8400-e29b-41d4-a716-446655440000)
            $table->uuid('uuid')->default(DB::raw('gen_random_uuid()'))->unique();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('order_number', 50)->unique();
            $table->decimal('total_amount', 12, 2);
            $table->enum('status', ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'])->default('pending');
            $table->string('payment_method', 30)->nullable();
            $table->text('shipping_address')->nullable();
            $table->string('contact_phone', 20)->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes(); // Nunca se borran las órdenes financieramente
        });

        // 4. Tabla: ORDER_ITEMS (Detalle de la compra)
        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            // restrictOnDelete(): Impide borrar un producto si ya fue vendido y está en una orden
            $table->foreignId('product_id')->constrained()->restrictOnDelete();
            $table->integer('quantity');
            $table->decimal('unit_price', 10, 2);
            $table->decimal('subtotal', 12, 2);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_items');
        Schema::dropIfExists('orders');
        Schema::dropIfExists('product_images');
        Schema::dropIfExists('products');
    }
};