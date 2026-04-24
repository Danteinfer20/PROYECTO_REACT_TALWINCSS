<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;
use App\Models\ContentType;
use Illuminate\Support\Str;

class SystemDictionarySeeder extends Seeder
{
    public function run(): void
    {
        // ==========================================
        // 1. DICCIONARIO DE CATEGORÍAS (Nivel 1)
        // ==========================================
        $categories = [
            // ARTE
            ['name' => 'Pintura', 'type' => 'art', 'color' => '#a855f7'],
            ['name' => 'Escultura', 'type' => 'art', 'color' => '#a855f7'],
            ['name' => 'Fotografía', 'type' => 'art', 'color' => '#a855f7'],
            ['name' => 'Arte digital', 'type' => 'art', 'color' => '#a855f7'],
            ['name' => 'Grabado', 'type' => 'art', 'color' => '#a855f7'],
            ['name' => 'Artesanía tradicional', 'type' => 'art', 'color' => '#a855f7'],
            ['name' => 'Música', 'type' => 'art', 'color' => '#a855f7'],
            ['name' => 'Danza', 'type' => 'art', 'color' => '#a855f7'],
            ['name' => 'Teatro', 'type' => 'art', 'color' => '#a855f7'],
            ['name' => 'Literatura', 'type' => 'art', 'color' => '#a855f7'],
            ['name' => 'Cine / Videoarte', 'type' => 'art', 'color' => '#a855f7'],

            // EDUCACIÓN
            ['name' => 'Historia del arte caucano', 'type' => 'education', 'color' => '#3b82f6'],
            ['name' => 'Técnicas pictóricas tradicionales', 'type' => 'education', 'color' => '#3b82f6'],
            ['name' => 'Patrimonio cultural inmaterial', 'type' => 'education', 'color' => '#3b82f6'],
            ['name' => 'Restauración y conservación', 'type' => 'education', 'color' => '#3b82f6'],
            ['name' => 'Gestión cultural', 'type' => 'education', 'color' => '#3b82f6'],
            ['name' => 'Música tradicional del Cauca', 'type' => 'education', 'color' => '#3b82f6'],
            ['name' => 'Semana Santa popayaneja', 'type' => 'education', 'color' => '#3b82f6'],
            ['name' => 'Rutas culturales de Popayán', 'type' => 'education', 'color' => '#3b82f6'],

            // EVENTOS
            ['name' => 'Festival de Música Religiosa', 'type' => 'event', 'color' => '#ef4444'],
            ['name' => 'Exposición temporal', 'type' => 'event', 'color' => '#ef4444'],
            ['name' => 'Concierto', 'type' => 'event', 'color' => '#ef4444'],
            ['name' => 'Taller / Masterclass', 'type' => 'event', 'color' => '#ef4444'],
            ['name' => 'Conversatorio / Panel', 'type' => 'event', 'color' => '#ef4444'],
            ['name' => 'Lanzamiento de obra', 'type' => 'event', 'color' => '#ef4444'],
            ['name' => 'Procesión', 'type' => 'event', 'color' => '#ef4444'],
            ['name' => 'Feria artesanal', 'type' => 'event', 'color' => '#ef4444'],
            ['name' => 'Teatro al parque', 'type' => 'event', 'color' => '#ef4444'],

            // PRODUCTOS (TIENDA)
            ['name' => 'Cuadros originales', 'type' => 'product', 'color' => '#f59e0b'],
            ['name' => 'Reproducciones artísticas', 'type' => 'product', 'color' => '#f59e0b'],
            ['name' => 'Artesanía decorativa', 'type' => 'product', 'color' => '#f59e0b'],
            ['name' => 'Instrumentos musicales', 'type' => 'product', 'color' => '#f59e0b'],
            ['name' => 'Joyería de filigrana', 'type' => 'product', 'color' => '#f59e0b'],
            ['name' => 'Cerámica utilitaria', 'type' => 'product', 'color' => '#f59e0b'],
            ['name' => 'Textiles (ruanas, mochilas)', 'type' => 'product', 'color' => '#f59e0b'],
            ['name' => 'Libros de arte local', 'type' => 'product', 'color' => '#f59e0b'],
        ];

        foreach ($categories as $cat) {
            Category::create([
                'name'          => $cat['name'],
                'slug'          => Str::slug($cat['name']),
                'category_type' => $cat['type'],
                'color'         => $cat['color'],
                'is_active'     => true,
            ]);
        }

        // ==========================================
        // 2. DICCIONARIO DE CLASIFICACIÓN/TÉCNICA (Nivel 2)
        // ==========================================
        $contentTypes = [
            'Óleo', 'Acuarela', 'Acrílico', 'Madera', 'Piedra', 'Metal', 'Barro', 
            'Documental', 'Artística', 'Patrimonial', 'Ilustración', 'NFT', 'Modelado 3D', 
            'Calcografía', 'Xilografía', 'Serigrafía', 'Cestería', 'Cerámica', 'Tejido', 
            'Platería', 'Andina', 'Carranga', 'Bambuco', 'Chirimía', 'Clásica', 
            'Folclórica', 'Contemporánea', 'Ballet', 'Calle', 'Sala', 'Títeres', 'Clown', 
            'Poesía', 'Cuento', 'Novela', 'Crónica', 'Cortometraje', 'Experimental',
            'Físico', 'Digital', 'Servicio' // Para productos
        ];

        foreach ($contentTypes as $type) {
            ContentType::create([
                'name' => $type,
                'description' => 'Técnica o formato de la publicación.'
            ]);
        }
    }
}