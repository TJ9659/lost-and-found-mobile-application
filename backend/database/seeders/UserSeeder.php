<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Storage::disk('public')->deleteDirectory('profiles');
        Storage::disk('public')->makeDirectory('profiles');

        $admin = User::updateOrCreate(
            ['email' => 'admin@utar.edu.my'], // unique check
            [
                'name' => 'UTAR Admin',
                'student_id' => null,
                'faculty' => 'LKC_FES',
                'email_verified_at' => now(),
                'password' => Hash::make('password'),
                'role' => 'admin',
            ]
        );
        $this->assignDefaultImage($admin);

        $defaultUser = User::updateOrCreate(
            ['email' => 'user@1utar.my'],
            [
                'name' => 'Test User',
                'student_id' => '246758',
                'faculty' => 'FICT',
                'email_verified_at' => now(),
                'password' => Hash::make('password'),
                'role' => 'user',
            ]
        );
        $this->assignDefaultImage($defaultUser);

        $defaultUser2 = User::updateOrCreate(
            ['email' => 'user2@1utar.my'], // unique check
            [
                'name' => 'User 2',
                'student_id' => '294840',
                'faculty' => 'FICT',
                'email_verified_at' => now(),
                'password' => Hash::make('password'),
                'role' => 'admin',
            ]
        );
        $this->assignDefaultImage($defaultUser2);

        User::factory(30)->create()->each(function ($user) {
            $this->assignDefaultImage($user);
        });
    }

    private function assignDefaultImage($user)
    {
        $uniqueName = "profile_{$user->id}.jpg";
        $path = "profiles/{$uniqueName}";

        if (File::exists(resource_path('images/default-image.png'))) {
            File::copy(
                resource_path('images/default-image.png'),
                storage_path("app/public/{$path}")
            );
            $user->update(['profile_pic' => $path]);
        }
    }
}
