<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Mutación de la tabla: PRODUCTS
        DB::statement("ALTER TABLE products ALTER COLUMN name TYPE jsonb USING jsonb_build_object('es', name, 'en', '')");
        DB::statement("ALTER TABLE products ALTER COLUMN description TYPE jsonb USING jsonb_build_object('es', description, 'en', '')");

        // 2. Mutación de la tabla: POSTS
        DB::statement("ALTER TABLE posts ALTER COLUMN title TYPE jsonb USING jsonb_build_object('es', title, 'en', '')");
        DB::statement("ALTER TABLE posts ALTER COLUMN excerpt TYPE jsonb USING jsonb_build_object('es', excerpt, 'en', '')");
        DB::statement("ALTER TABLE posts ALTER COLUMN content TYPE jsonb USING jsonb_build_object('es', content, 'en', '')");

        // 3. Mutación de la tabla: CATEGORIES
        DB::statement("ALTER TABLE categories ALTER COLUMN name TYPE jsonb USING jsonb_build_object('es', name, 'en', '')");
        DB::statement("ALTER TABLE categories ALTER COLUMN description TYPE jsonb USING jsonb_build_object('es', description, 'en', '')");
    }

    public function down(): void
    {
        // Rollback de seguridad: Extrae únicamente el valor en español ('es') y lo devuelve a texto plano.
        DB::statement("ALTER TABLE products ALTER COLUMN name TYPE varchar(200) USING name->>'es'");
        DB::statement("ALTER TABLE products ALTER COLUMN description TYPE text USING description->>'es'");

        DB::statement("ALTER TABLE posts ALTER COLUMN title TYPE varchar(200) USING title->>'es'");
        DB::statement("ALTER TABLE posts ALTER COLUMN excerpt TYPE varchar(300) USING excerpt->>'es'");
        DB::statement("ALTER TABLE posts ALTER COLUMN content TYPE text USING content->>'es'");

        DB::statement("ALTER TABLE categories ALTER COLUMN name TYPE varchar(100) USING name->>'es'");
        DB::statement("ALTER TABLE categories ALTER COLUMN description TYPE text USING description->>'es'");
    }
};