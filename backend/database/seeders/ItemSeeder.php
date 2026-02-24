<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Item;
use App\Models\User;

class ItemSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get first user for demo ownership, or null
        $user = User::first();

        $items = [
            [
                'user_id' => $user?->id,
                'name' => 'Red Water Bottle',
                'description' => 'A bright red water bottle left in KA building.',
                'non_claimable' => false,
                'status' => 'found',
                'building' => 'KA',
                'location' => 'Lobby',
                'floor' => '1',
                'category' => 'accessories',
                'image_path' => 'images/default-image.png',
                'image_labels' => json_encode(['bottle', 'red']),
                'image_text' => json_encode([]),
                'in_transaction' => false,
                'is_claimed' => false,
                'claimed_by' => null,
                'is_exchanged' => false,
            ],
            [
                'user_id' => $user?->id,
                'name' => 'Lost Black Umbrella',
                'description' => 'Black umbrella left near KB floor 2.',
                'non_claimable' => false,
                'status' => 'lost',
                'building' => 'KB',
                'location' => 'Near elevator',
                'floor' => '2',
                'category' => 'accessories',
                'image_path' => 'images/default-image.png',
                'image_labels' => json_encode(['umbrella', 'black']),
                'image_text' => json_encode([]),
                'in_transaction' => false,
                'is_claimed' => false,
                'claimed_by' => null,
                'is_exchanged' => false,
            ],
            [
                'user_id' => $user?->id,
                'name' => 'Found Keys',
                'description' => 'A set of keys found in KA building.',
                'non_claimable' => false,
                'status' => 'found',
                'building' => 'KA',
                'location' => 'Cafeteria',
                'floor' => '1',
                'category' => 'accessories',
                'image_path' => 'images/default-image.png',
                'image_labels' => json_encode(['keys']),
                'image_text' => json_encode([]),
                'in_transaction' => false,
                'is_claimed' => false,
                'claimed_by' => null,
                'is_exchanged' => false,
            ],
        ];

        foreach ($items as $itemData) {
            Item::create($itemData);
        }
    }
}
