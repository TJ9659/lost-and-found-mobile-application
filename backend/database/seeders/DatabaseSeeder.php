<?php

namespace Database\Seeders;

use App\Models\Claim;
use App\Models\Item;
use App\Models\User;
use Database\Factories\ItemFactory;
use Database\Factories\UserFactory;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 'profile_pic' => 'images/default.png',
        Storage::disk('public')->deleteDirectory('items');
        Storage::disk('public')->makeDirectory('items');
        $this->call([
            UserSeeder::class,
            CategorySeeder::class,
        ]);

        $admin = User::where('role', 'admin')->first();

        Item::factory(50)->create()->each(function ($item) {
            $uniqueName = "item_{$item->id}.jpg";
            $path = "items/{$uniqueName}";

            File::copy(
                resource_path('images/placeholder.jpg'),
                storage_path("app/public/{$path}")
            );

            $item->update(['image_path' => $path]);
        });

        Item::factory(20)->create([
            'non_claimable' => true,
            'user_id' => $admin->id,
            'status' => 'found'
        ])->each(function ($item) {
            $uniqueName = "item_{$item->id}.jpg";
            $path = "items/{$uniqueName}";

            File::copy(
                resource_path('images/placeholder.jpg'),
                storage_path("app/public/{$path}")
            );

            $item->update(['image_path' => $path]);
        });

        $normalUsers = User::where('role', 'user')->get();
        $claimableItems = Item::where('non_claimable', false)->get();

        $claimableItems->take(5)->each(function ($item) use ($normalUsers) {
            $item->update(['in_transaction' => true]);
            Claim::factory()->create([
                'item_id' => $item->id,
                'claimer_id' => $normalUsers->random()->id,
                'status' => 'pending'
            ]);
        });

        $claimableItems->skip(5)->take(5)->each(function ($item) use ($normalUsers, $admin) {
            $item->update([
                'is_claimed' => true,
                'is_exchanged' => true,
                'in_transaction' => false
            ]);

            \App\Models\Claim::factory()->create([
                'item_id' => $item->id,
                'claimer_id' => $normalUsers->random()->id,
                'approved_by' => $admin->id,
                'status' => 'approved',
                'exchanged' => true,
                'exchanged_at' => now(),
                'approved_at' => now()->subDays(1),
            ]);
        });
    }
}
