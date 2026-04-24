<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Tabla: COMMENTS (Polimórfica)
        Schema::create('comments', function (Blueprint $table) {
            $table->id();
            // morphs() crea mágicamente 'commentable_type' (ej. App\Models\Post) y 'commentable_id'
            $table->morphs('commentable'); 
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            // Referencia a sí misma para respuestas a comentarios (Hilos)
            $table->foreignId('parent_id')->nullable()->constrained('comments')->cascadeOnDelete();
            $table->text('content');
            $table->integer('like_count')->default(0);
            $table->boolean('is_edited')->default(false);
            $table->enum('status', ['visible', 'hidden', 'reported'])->default('visible');
            $table->timestamps();
        });

        // 2. Tabla: REACTIONS (Polimórfica)
        Schema::create('reactions', function (Blueprint $table) {
            $table->id();
            $table->morphs('reactable'); // reactable_type y reactable_id
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->enum('reaction_type', ['like', 'love', 'inspire', 'interest']);
            $table->timestamps();
            
            // Un usuario solo puede reaccionar una vez al mismo elemento
            $table->unique(['reactable_type', 'reactable_id', 'user_id'], 'user_reaction_unique');
        });

        // 3. Tabla: SAVED ITEMS (Favoritos y Guardados - Polimórfica)
        Schema::create('saved_items', function (Blueprint $table) {
            $table->id();
            $table->morphs('savable'); // savable_type y savable_id
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->enum('category', ['read_later', 'favorites', 'inspiration', 'educational'])->default('favorites');
            $table->timestamps();

            // Un usuario solo puede guardar un mismo elemento una vez por categoría
            $table->unique(['user_id', 'savable_type', 'savable_id'], 'user_saved_unique');
        });

        // 4. Tabla: FOLLOWS (Seguidores entre usuarios)
        Schema::create('follows', function (Blueprint $table) {
            $table->id();
            $table->foreignId('follower_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('following_id')->constrained('users')->cascadeOnDelete();
            $table->boolean('notifications_enabled')->default(true);
            $table->timestamps();

            // Un usuario no puede seguir a otro más de una vez
            $table->unique(['follower_id', 'following_id']);
        });

        // 5. Tabla: NOTIFICATIONS (Campanita del sistema)
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->enum('type', ['new_follower', 'comment', 'reaction', 'event_reminder', 'message', 'sale', 'system', 'educational']);
            $table->string('title', 200);
            $table->text('message');
            $table->string('action_url', 255)->nullable();
            $table->boolean('is_read')->default(false);
            $table->timestamp('read_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications');
        Schema::dropIfExists('follows');
        Schema::dropIfExists('saved_items');
        Schema::dropIfExists('reactions');
        Schema::dropIfExists('comments');
    }
};