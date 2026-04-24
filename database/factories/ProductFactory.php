<?php

namespace Database\Factories;

use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProductFactory extends Factory
{
    protected $model = Product::class;

    public function definition(): array
    {
        $imagenesHandicraft = [
            'https://images.unsplash.com/photo-1615592389070-bcc48f5501eb?q=80&w=800',
            'https://images.unsplash.com/photo-1516089308696-e2a221f7dff7?q=80&w=800',
            'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?q=80&w=800',
            'https://images.unsplash.com/photo-1531581147762-5961e6e281df?q=80&w=800',
        ];

        return [
            'name' => ucfirst(fake()->words(3, true)),
            'description' => fake()->paragraph(3),
            'price' => fake()->randomFloat(2, 45000, 950000),
            'stock_quantity' => fake()->numberBetween(1, 20),
            'product_type' => 'handicraft',
            'materials' => fake()->randomElement(['Madera tallada', 'Cerámica', 'Lana virgen', 'Seda']),
            'dimensions' => fake()->randomElement(['20x30 cm', '15x15x15 cm', 'Talla Única']),
            'weight_kg' => fake()->randomFloat(2, 0.2, 4.0),
            'main_image' => fake()->randomElement($imagenesHandicraft),
            'status' => 'available',
            'is_featured' => fake()->boolean(20),
        ];
    }
}