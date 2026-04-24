<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use App\Models\Category;
use App\Models\ContentType;
use App\Models\Post;
use App\Models\PostMedia;
use App\Models\Event;
use App\Models\Location;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\EducationalContent;

class DatabaseSeeder extends Seeder
{
    /**
     * El núcleo de ejecución.
     * Solo las reglas del sistema (Categorías y Técnicas) se siembran aquí.
     */
    public function run(): void
    {
        $this->command->info('🛡️ Iniciando Diccionario de Sistema (Categorías V2)...');

        $this->call([
            SystemDictionarySeeder::class,
        ]);

        $this->command->info('✅ Diccionario forjado con éxito. Base de datos prístina y lista para producción.');
    }

    /* ==========================================================================
    📦 HISTORIAL DE GENERACIÓN MASIVA (FACTORIES)
    Mantenemos esta lógica comentada para futuras pruebas de estrés o Testing.
    ==========================================================================
    
    public function runTestingData(): void
    {
        $this->command->info('🚀 Iniciando Sembrado Maestro de Popayán Cultural (V1.1)...');

        // 0. LIMPIEZA QUIRÚRGICA
        DB::statement('TRUNCATE users, categories, content_types, posts, post_media, products, product_images, locations, events, educational_content CASCADE');

        // 1. EL NÚCLEO: Cuenta Administradora (Julián)
        $admin = User::create([
            'name' => 'Julián',
            'username' => 'julian_admin',
            'email' => 'admin@popayancultural.com',
            'password' => Hash::make('password123'),
            'user_type' => 'admin',
            'bio' => 'Líder del proyecto Popayán Cultural y gestor de contenido.',
            'is_verified' => true,
        ]);

        // ... (resto del código de ContentType, Category, Locations y Factories)
    }
    */
}