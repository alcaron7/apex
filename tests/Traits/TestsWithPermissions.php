<?php

namespace Tests\Traits;

use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

trait TestsWithPermissions
{
    public function createUserWithPermission(string $permission): \App\Models\User
    {
        if (!Permission::where('name', $permission)->exists()) {
            Permission::create(['name' => $permission]);
        }

        $user = \App\Models\User::factory()->create();
        $user->givePermissionTo($permission);

        return $user;
    }

    public function createUserWithoutPermission(): \App\Models\User
    {
        return \App\Models\User::factory()->create();
    }
}