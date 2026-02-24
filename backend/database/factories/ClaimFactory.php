<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Claim>
 */
class ClaimFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'message' => $this->faker->sentence(),
            'location_detail' => $this->faker->streetName(),
            'datetime_detail' => $this->faker->dateTimeBetween('-1 month', 'now'),
            'status' => 'pending',
            'exchanged' => false,
        ];
    }
}
