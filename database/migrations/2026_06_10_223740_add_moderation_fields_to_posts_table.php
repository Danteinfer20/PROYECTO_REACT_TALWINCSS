<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
{
    Schema::table('posts', function (Blueprint $table) {
        $table->enum('moderation_status', ['pending', 'approved', 'rejected', 'manual_review'])
              ->default('pending')
              ->after('status');
        $table->text('moderation_notes')->nullable()->after('moderation_status');
        $table->timestamp('moderated_at')->nullable()->after('moderation_notes');
        $table->foreignId('moderated_by')->nullable()->constrained('users')->after('moderated_at');
        $table->json('ai_moderation_result')->nullable()->after('moderated_by');
    });
}
    /**
     * Reverse the migrations.
     */
    public function down()
{
    Schema::table('posts', function (Blueprint $table) {
        $table->dropColumn([
            'moderation_status', 'moderation_notes', 
            'moderated_at', 'moderated_by', 'ai_moderation_result'
        ]);
    });
}
};
