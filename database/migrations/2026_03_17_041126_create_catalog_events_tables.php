<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Tabla: POSTS (El núcleo del contenido)
        Schema::create('posts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('category_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('content_type_id')->constrained()->cascadeOnDelete();
            $table->string('title', 200);
            $table->string('slug', 250)->unique();
            $table->string('excerpt', 300)->nullable();
            $table->text('content');
            $table->enum('status', ['draft', 'published', 'archived'])->default('draft');
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_educational')->default(false);
            $table->integer('view_count')->default(0);
            $table->integer('share_count')->default(0);
            $table->boolean('allow_comments')->default(true);
            $table->timestamp('published_at')->nullable();
            $table->timestamps();
            $table->softDeletes(); // Protege el contenido de borrados accidentales
        });

        // 2. Tabla: POST_MEDIA (Imágenes, videos, audios de los posts)
        Schema::create('post_media', function (Blueprint $table) {
            $table->id();
            $table->foreignId('post_id')->constrained()->cascadeOnDelete();
            $table->enum('file_type', ['image', 'video', 'audio', 'document']);
            $table->string('file_path', 500);
            $table->string('file_name', 255);
            $table->integer('file_size')->nullable();
            $table->integer('sort_order')->default(0);
            $table->string('alt_text', 200)->nullable();
            $table->boolean('is_cover')->default(false);
            $table->timestamps();
        });

        // 3. Tabla: POST_TAGS (Relación Muchos a Muchos)
        Schema::create('post_tags', function (Blueprint $table) {
            $table->id();
            $table->foreignId('post_id')->constrained()->cascadeOnDelete();
            $table->foreignId('tag_id')->constrained()->cascadeOnDelete();
            $table->timestamps();
            
            $table->unique(['post_id', 'tag_id']); // Evita etiquetas duplicadas en un mismo post
        });

        // 4. Tabla: EVENTS (Hereda de Posts)
        Schema::create('events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('post_id')->unique()->constrained()->cascadeOnDelete();
            $table->foreignId('location_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('organizer_id')->constrained('users')->cascadeOnDelete();
            $table->timestamp('start_date');
            $table->timestamp('end_date');
            $table->decimal('price', 10, 2)->default(0.00);
            $table->integer('max_capacity')->nullable();
            $table->integer('available_slots')->nullable();
            $table->boolean('requires_rsvp')->default(false);
            $table->enum('event_type', ['free', 'paid', 'donation'])->default('free');
            $table->enum('event_status', ['scheduled', 'ongoing', 'completed', 'cancelled'])->default('scheduled');
            $table->timestamps();
            $table->softDeletes();
        });

        // 5. Tabla: PERFORMING_ARTS (Detalles técnicos de artes escénicas)
        Schema::create('performing_arts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained()->cascadeOnDelete();
            $table->enum('art_type', ['circus', 'theater', 'dance', 'performance', 'magic', 'music', 'storytelling']);
            $table->integer('duration_minutes')->nullable();
            $table->string('artistic_director', 150)->nullable();
            $table->string('company', 150)->nullable();
            $table->string('genre', 100)->nullable();
            $table->string('target_audience', 50)->nullable();
            $table->text('technical_requirements')->nullable();
            $table->jsonb('cast_members')->nullable(); // JSONB Nativo para el elenco
            $table->timestamps();
        });

        // 6. Tabla: EVENT_ATTENDANCE (Asistentes)
        Schema::create('event_attendance', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->enum('status', ['confirmed', 'interested', 'not_attending', 'attended'])->default('interested');
            $table->integer('guest_count')->default(0);
            $table->string('qr_code', 100)->unique()->nullable();
            $table->boolean('checked_in')->default(false);
            $table->timestamp('checked_in_at')->nullable();
            $table->timestamps();
            
            $table->unique(['event_id', 'user_id']); // Un usuario no puede registrarse dos veces al mismo evento
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('event_attendance');
        Schema::dropIfExists('performing_arts');
        Schema::dropIfExists('events');
        Schema::dropIfExists('post_tags');
        Schema::dropIfExists('post_media');
        Schema::dropIfExists('posts');
    }
};