<?php

use App\Http\Controllers\Administration\AdministrationController;
use App\Http\Controllers\Administration\UsersController;
use App\Http\Controllers\Administration\RolesController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->group(function () {
    Route::get('administration', [AdministrationController::class, 'index'])->name('administration.index');

    Route::resource('administration/users', UsersController::class, ['only' => ['index', 'store', 'edit', 'update']])
    ->parameters([
        'users' => 'user',
    ])
    ->middleware([
        'index' => 'can:users.index',
    ]);


    Route::get('administration/users/{user}/archive', [UsersController::class, 'archive'])->name('administration.users.archive')->middleware('can:users.index');
    Route::get('administration/users/{user}/unarchive', [UsersController::class, 'unarchive'])->name('administration.users.unarchive')->middleware('can:users.index');
    Route::get('administration/users/{user}/history', [UsersController::class, 'history'])->name('administration.users.history')->middleware('can:users.index');

    Route::resource('administration/roles', RolesController::class, ['only' => ['index', 'edit', 'update', 'store']])
    ->middleware([
        'index' => 'can:roles.index',
    ]);
});
