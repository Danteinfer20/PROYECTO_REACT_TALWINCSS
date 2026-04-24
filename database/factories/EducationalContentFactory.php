<?php

namespace Database\Factories;

use App\Models\EducationalContent;
use Illuminate\Database\Eloquent\Factories\Factory;

class EducationalContentFactory extends Factory
{
    protected $model = EducationalContent::class;

    public function definition(): array
    {
        return [
            'difficulty_level' => fake()->randomElement(['beginner', 'intermediate', 'advanced']),
            'estimated_read_time' => fake()->numberBetween(5, 45), // minutos
            'knowledge_area' => fake()->randomElement(['Técnicas de Tejido', 'Historia Patoja', 'Cerámica Precolombina', 'Gestión Cultural']),
            'historical_period' => fake()->randomElement(['Época Colonial', 'Siglo XIX', 'Contemporáneo']),
            'learning_objectives' => [
                fake()->sentence(),
                fake()->sentence(),
                fake()->sentence()
            ],
            'cultural_significance' => fake()->paragraph(2),
            'ai_generated' => false,
        ];
    }
}