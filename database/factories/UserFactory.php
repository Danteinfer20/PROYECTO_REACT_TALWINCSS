<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserFactory extends Factory
{
    protected static ?string $password;

    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'username' => fake()->unique()->userName(),
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('password123'),
            'remember_token' => Str::random(10),
            'user_type' => fake()->randomElement(['artist', 'cultural_manager', 'visitor', 'educator']),
            'birth_date' => fake()->dateTimeBetween('-60 years', '-18 years')->format('Y-m-d'),
            'city' => 'Popayán',
            'bio' => fake()->realText(150),
            'is_verified' => true,
            'status' => 'active',
            'profile_picture' => 'https://ui-avatars.com/api/?background=111113&color=a855f7&bold=true&name=' . urlencode(fake()->name()),
        ];
    }
}