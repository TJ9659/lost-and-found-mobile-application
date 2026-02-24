<?php

namespace Database\Factories;

use App\Models\Category;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Item>
 */
class ItemFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $locationsMap = [
            "KA" => [
                "G" => ["Reception", "Administrative Offices", "Lecture Theatres", "Bookstore"],
                "1" => ["Labs", "Postgraduate Offices", "Library Workshop", "Reading Room"],
                "2" => ["Labs", "Multimedia Resource Centre", "Display Museum"],
                "3" => ["Academic Staff Rooms", "Simulation Ward", "Physiotherapy Centre"],
                "4" => ["Computer and Internet Labs", "Tutorial Rooms"],
                "8" => ["Tutorial Rooms", "Roof Garden"]
            ],
            "KB" => [
                "G" => ["Administrative Offices", "Meeting Rooms", "Multipurpose Hall"],
                "1" => ["Lecture Theatres", "Tutorial Rooms", "Gym", "Student Activity Area"],
                "2" => ["Lecture Rooms", "Academic Staff Rooms", "Surau (Female)"],
                "3" => ["Lecture Rooms", "Tutorial Rooms", "Academic Staff Rooms"],
                "3A" => ["Labs", "Library Staff Rooms"],
                "5" => ["Labs", "Tutorial Rooms", "Lecture Rooms"],
                "6" => ["Labs", "Architecture Studio"],
                "7" => ["Labs", "Tutorial Rooms", "Photo/Art/Game/Design Rooms"],
                "8" => ["Academic Staff Rooms", "Faculty Offices", "Labs"],
                "9" => ["Labs", "Staff Rooms", "Faculty Offices"],
                "10" => ["Administrative Offices", "Conference Room", "Multimedia Room"]
            ]
        ];

        $building = array_rand($locationsMap);
        $floor = array_rand($locationsMap[$building]);
        $location = fake()->randomElement($locationsMap[$building][$floor]);

        // due to the possibility of the Google Vision API free trial expiring, its better to use this to ensure it won't break the nlp service
        $tagPool = ['red', 'blue', 'metal', 'plastic', 'small', 'heavy', 'electronic', 'branded', 'broken', 'new'];
        $randomTags = fake()->randomElements($tagPool, rand(1, 3));

        return [
            'user_id' => rand(2, 3),
            'name' => fake()->words(2, true),
            'description' => fake()->sentence(),
            'non_claimable' => false,
            'status' => fake()->randomElement(['lost', 'found']),
            'building' => $building,
            'floor' => (string)$floor,
            'location' => $location,
            'category_id' => Category::inRandomOrder()->first()?->id ?? 1,
            'image_path' => 'items/placeholder.jpg',
            'tags' => $randomTags,
            'in_transaction' => false,
            'is_claimed' => false,
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }
}
