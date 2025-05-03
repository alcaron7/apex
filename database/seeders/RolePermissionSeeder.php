<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Super-Administrateur
        $permissions = [
            'users.index' => 'Gérer les utilisateurs',
            'roles.index' => 'Gérer les rôles',
        ];

        foreach ($permissions as $name => $displayName) {
            Permission::firstOrCreate(
                ['name' => $name],
                ['display_name' => $displayName]
            );
        }
    
        $superAdminRole = Role::firstOrCreate(['name' => 'Super-Administrateur']);
        $superAdminRole->syncPermissions(array_keys($permissions));
    }
}
