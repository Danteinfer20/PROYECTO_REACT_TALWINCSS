<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Tabla: CONTENT TYPES
        Schema::create('content_types', function (Blueprint $table) {
            $table->id();
            $table->string('name', 50)->unique();
            $table->text('description')->nullable();
            $table->boolean('allows_events')->default(false);
            $table->boolean('allows_education')->default(false);
            $table->string('icon')->nullable();
            $table->timestamps();
        });

        // 2. Tabla: CATEGORIES
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100)->unique();
            $table->text('description')->nullable();
            $table->string('icon')->nullable();
            $table->string('color', 7)->nullable();
            $table->string('slug', 100)->unique();
            $table->enum('category_type', ['art', 'event', 'product', 'education'])->default('art');
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->foreignId('parent_id')->nullable()->constrained('categories')->nullOnDelete();
            $table->timestamps();
        });

        // 3. Tabla: LOCATIONS (Geolocalización y Mapas)
        Schema::create('locations', function (Blueprint $table) {
            $table->id();
            $table->string('name', 150);
            $table->string('address');
            $table->string('neighborhood', 100)->nullable();
            $table->string('city', 100)->default('Popayán');
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->enum('location_type', ['museum', 'theater', 'gallery', 'street', 'park', 'cultural_center', 'auditorium', 'library', 'educational_center'])->nullable();
            $table->string('phone', 20)->nullable();
            $table->string('opening_hours', 200)->nullable();
            $table->text('description')->nullable();
            $table->string('photo')->nullable();
            $table->string('website')->nullable();
            $table->integer('capacity')->nullable();
            $table->boolean('is_accessible')->default(true);
            $table->timestamps();
        });

        // 4. Tabla: TAGS
        Schema::create('tags', function (Blueprint $table) {
            $table->id();
            $table->string('name', 50)->unique();
            $table->string('slug', 60)->unique();
            $table->enum('tag_type', ['art', 'place', 'technique', 'era', 'general', 'educational'])->default('general');
            $table->integer('usage_count')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tags');
        Schema::dropIfExists('locations');
        Schema::dropIfExists('categories');
        Schema::dropIfExists('content_types');
    }
};