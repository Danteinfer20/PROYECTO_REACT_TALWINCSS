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
    Schema::create('user_statistics', function (Blueprint $table) {
        $table->id();
        
        // Relación 1:1 con Users
        $table->foreignId('user_id')
              ->unique()
              ->constrained('users')
              ->onDelete('cascade');

        // Contadores (Enteros)
        $table->integer('post_count')->default(0);
        $table->integer('follower_count')->default(0);
        $table->integer('following_count')->default(0);
        $table->integer('event_count')->default(0);
        $table->integer('attendance_count')->default(0);
        $table->integer('sales_count')->default(0);
        $table->integer('educational_content_count')->default(0);

        // Métricas financieras y de calidad (Decimales)
        $table->decimal('average_rating', 3, 2)->default(0.00);
        $table->decimal('total_revenue', 12, 2)->default(0.00);

        $table->timestamps(); // Provee created_at y updated_at
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_statistics');
    }
};
