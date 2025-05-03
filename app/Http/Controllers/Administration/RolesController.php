<?php

namespace App\Http\Controllers\Administration;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use App\Http\Requests\Roles\StoreRoleRequest;

class RolesController extends Controller
{
    public function index()
    {
        $roles = Role::orderBy('name')->get();
        return Inertia::render('administration/roles/index', [
            'roles' => $roles
        ]);
    }

    public function edit(Role $role)
    {
        $role->load('permissions');

        $permissions = Permission::orderBy('name')->get();
        return Inertia::render('administration/roles/[id]/edit', [
            'role' => [
                'id' => $role->id,
                'name' => $role->name,
                'permissions' => $role->permissions->pluck('name'),
            ],
            'permissions' => $permissions
        ]);
    }

    public function update(Request $request, Role $role)
    {
        $role->syncPermissions($request->permissions);
        return back()->with('success', 'Rôle mis à jour avec succès');
    }

    public function store(StoreRoleRequest $request)
    {
        $role = Role::create($request->all());
        return redirect()->route('roles.edit', $role->id)->with([
            'success' => 'Rôle créé avec succès',
            'created_role_id' => $role->id,
        ]);
    }

}
