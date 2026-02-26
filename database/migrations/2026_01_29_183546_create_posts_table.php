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
    Schema::create('posts', function (Blueprint $table) {
        $table->id();
        
        // LLAVES FORÁNEAS (Relaciones)
        $table->foreignId('user_id')->constrained()->onDelete('cascade');
        
        // SET NULL: Si borras la categoría, el post NO se borra, solo queda sin categoría
        $table->foreignId('category_id')->nullable()->constrained()->onDelete('set null');
        
        // RESTRICT: No permite borrar un Tipo de Contenido si hay posts usándolo
        $table->foreignId('content_type_id')->constrained()->onDelete('restrict');

        $table->string('title', 200);
        $table->string('slug', 250)->unique();
        $table->string('excerpt', 300)->nullable();
        $table->text('content');
        
        $table->string('status', 20)->default('draft');
        $table->boolean('is_featured')->default(false);
        $table->boolean('is_educational')->default(false);
        
        $table->integer('view_count')->default(0);
        $table->integer('share_count')->default(0);
        $table->boolean('allow_comments')->default(true);
        $table->timestamp('published_at')->nullable();

        $table->timestamps();
    });

    // CHECK nativo para el estado del post
    DB::statement("ALTER TABLE posts ADD CONSTRAINT chk_status_post CHECK (status IN ('draft', 'published', 'archived'))");
}
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('posts');
    }
};
