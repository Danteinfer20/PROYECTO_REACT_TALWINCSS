<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB; // No olvides esta línea para el CHECK constraint

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('categories', function (Blueprint $table) {
            $table->id(); // id SERIAL PRIMARY KEY
            $table->string('name', 100)->unique();
            $table->text('description')->nullable();
            $table->string('icon', 255)->nullable();
            $table->string('color', 7)->nullable();
            $table->string('slug', 100)->unique();
            
            // Definimos el tipo como string para aplicar el CHECK después
            $table->string('category_type', 20)->default('art');
            
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);

            // Relación recursiva (referencia a la misma tabla)
            $table->foreignId('parent_id')
                  ->nullable()
                  ->constrained('categories')
                  ->onDelete('set null');

            $table->timestamps(); // Crea created_at y updated_at
        });

        // Aplicamos la restricción CHECK nativa de tu SQL
        DB::statement("ALTER TABLE categories ADD CONSTRAINT chk_category_type CHECK (category_type IN ('art', 'event', 'product', 'education'))");
    }

    public function down(): void
    {
        Schema::dropIfExists('categories');
    }
};