<?php

namespace Database\Factories;

use App\Models\Post;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class PostFactory extends Factory
{
    protected $model = Post::class;

    public function definition(): array
    {
        $title = fake()->realText(45);
        return [
            'title' => $title,
            'slug' => Str::slug($title) . '-' . Str::random(5),
            'excerpt' => fake()->realText(120),
            'content' => fake()->paragraphs(4, true),
            'status' => 'published',
            'is_featured' => fake()->boolean(30),
            'is_educational' => false,
            'view_count' => fake()->numberBetween(10, 5000),
            'share_count' => fake()->numberBetween(0, 300),
            'published_at' => now(),
        ];
    }
}