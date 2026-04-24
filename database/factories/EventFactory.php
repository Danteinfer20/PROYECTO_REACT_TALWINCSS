<?php

namespace Database\Factories;

use App\Models\Event;
use Illuminate\Database\Eloquent\Factories\Factory;
use Carbon\Carbon;

class EventFactory extends Factory
{
    protected $model = Event::class;

    public function definition(): array
    {
        // Generar una ventana de tiempo lógica: de hoy a 60 días
        $startDate = Carbon::now()->addDays(fake()->numberBetween(1, 60))->setTime(fake()->numberBetween(8, 19), 0);
        $endDate = (clone $startDate)->addHours(fake()->numberBetween(2, 6));

        $isPaid = fake()->boolean(40);
        $capacity = fake()->randomElement([50, 100, 200, 500]);

        return [
            'start_date' => $startDate,
            'end_date' => $endDate,
            'price' => $isPaid ? fake()->randomFloat(2, 15000, 120000) : 0.00,
            'max_capacity' => $capacity,
            'available_slots' => fake()->numberBetween(0, $capacity),
            'requires_rsvp' => fake()->boolean(70),
            'event_type' => $isPaid ? 'paid' : 'free',
            'event_status' => 'scheduled',
        ];
    }
}