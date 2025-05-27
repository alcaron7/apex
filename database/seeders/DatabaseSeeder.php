<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Database\Seeders\RolePermissionSeeder;
use App\Models\User;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            RolePermissionSeeder::class,
            TaxesSeeder::class
        ]);

        /*$user = User::create([
            'name' => 'Alex Caron',
            'email' => 'alex@alexcaron.ca',
            'password' => bcrypt('default')
        ]);

        $user->assignRole('Super-Administrateur');*/
    }
}
