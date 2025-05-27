<?php

namespace App\Http\Controllers\Administration;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\User;
use App\Http\Requests\Users\UpdateUserRequest;
use App\Http\Requests\Users\StoreUserRequest;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;
use App\Services\ActivityLogFormatter;
use App\Services\SyncLogger;

class UsersController extends Controller
{
    public function index()
    {
        $users = User::with('roles')->orderBy('name')->get();
        $roles = Role::orderBy('name')->get(['id', 'name']);
        return Inertia::render('administration/users/index', [
            'users' => $users,
            'roles' => $roles
        ]);
    }

    public function store(StoreUserRequest $request)
    {
        $user = User::create($request->all());

        if ($request->filled('role_id')) {
            $role = Role::find($request->role_id);
            if ($role) {
                $user->syncRoles([$role->name]); 
            }
        }

        return redirect()->route('administration.users.index')->with('success', 'Utilisateur créé avec succès');
    }

    public function update(UpdateUserRequest $request, User $user)
    {
        $user->update($request->except('password'));

        if ($request->filled('password')) {
            $user->password = Hash::make($request->password);
            $user->save();
        }
    
        if ($request->filled('role_id')) {
            $oldRoleIds = $user->roles->pluck('id')->toArray();
            $role = Role::find($request->role_id);
            if ($role) {
                $user->syncRoles([$role->name]); 
            }

            $roleNames = Role::pluck('name', 'id')->toArray();

            SyncLogger::logSyncChange(
                $user,
                'roles',
                $oldRoleIds,
                [$role->id],
                'rôle',
                $roleNames
            );
        }

        return back()->with('success', 'Utilisateur mis à jour avec succès');
    }

    public function edit($id)
    {
        $user = User::with('roles')->findOrFail($id);
        $roles = Role::orderBy('name')->get(['id', 'name']);

        return Inertia::render('administration/users/[id]/edit', [
            'user' => $user,
            'roles' => $roles,
        ]);
    }

    public function archive(User $user)
    {
        $user->archived = true;
        $user->save();
        return redirect()->route('administration.users.index')->with('success', 'Utilisateur archivé avec succès');
    }

    public function unarchive(User $user)
    {
        $user->archived = false;
        $user->save();
        return redirect()->route('administration.users.index')->with('success', 'Utilisateur désarchivé avec succès');
    }

    public function history(User $user)
    {
        $history = ActivityLogFormatter::paginate($user);
        return response()->json($history);
    }
}
