<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * 🔥 EJECUCIÓN: Expandir la estructura para auditoría de rechazos.
     */
    public function up(): void
    {
        if (Schema::hasTable('creator_applications')) {
            Schema::table('creator_applications', function (Blueprint $table) {
                // Inyectamos la columna después del estado para mantener orden lógico
                $table->text('rejection_reason')
                      ->nullable()
                      ->after('status')
                      ->comment('Justificación legal del rechazo de ascenso');
            });
        }
    }

    /**
     * 🛡️ REVERSIÓN: Contraer la estructura de forma segura.
     */
    public function down(): void
    {
        if (Schema::hasTable('creator_applications')) {
            Schema::table('creator_applications', function (Blueprint $table) {
                // Eliminamos la columna si decidimos deshacer este cambio
                if (Schema::hasColumn('creator_applications', 'rejection_reason')) {
                    $table->dropColumn('rejection_reason');
                }
            });
        }
    }
};