<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Sincronización con el sistema de Ubicación Libre.
     */
    public function up(): void
    {
        Schema::table('events', function (Blueprint $table) {
            // 🔥 Añadimos los estantes físicos para la Referencia Libre
            $table->string('custom_location_name', 150)->nullable()->after('location_id');
            $table->string('custom_address', 255)->nullable()->after('custom_location_name');
            $table->decimal('latitude', 10, 8)->nullable()->after('custom_address');
            $table->decimal('longitude', 11, 8)->nullable()->after('latitude');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('events', function (Blueprint $table) {
            // 🛡️ Protocolo de reversión: eliminamos los campos añadidos
            $table->dropColumn(['custom_location_name', 'custom_address', 'latitude', 'longitude']);
        });
    }
};