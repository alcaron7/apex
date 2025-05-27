<?php

use App\Http\Controllers\Administration\AdministrationController;
use App\Http\Controllers\Administration\RepresentantsController;
use App\Http\Controllers\Administration\UsersController;
use App\Http\Controllers\Administration\RolesController;
use App\Http\Controllers\Administration\TransporteursController;
use App\Http\Controllers\Administration\CollectionsController;
use App\Http\Controllers\Administration\CouleursController;
use App\Http\Controllers\Administration\FinitionsController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Administration\FournisseurCategoriesController;
use App\Http\Controllers\Administration\FournisseursController;


Route::middleware('auth')->prefix('administration')->name('administration.')->group(function () {

    Route::get('/', [AdministrationController::class, 'index'])
        ->name('index')
        ->middleware('can:administration.index');

    // USERS
    Route::resource('users', UsersController::class)
        ->only(['index', 'store', 'edit', 'update'])
        ->names([
           'index' => 'users.index'
        ])
        ->parameters(['users' => 'user'])
        ->middleware(['index' => 'can:users.index']);

    Route::get('users/{user}/archive', [UsersController::class, 'archive'])
        ->name('users.archive')
        ->middleware('can:users.index');

    Route::get('users/{user}/unarchive', [UsersController::class, 'unarchive'])
        ->name('users.unarchive')
        ->middleware('can:users.index');

    Route::get('users/{user}/history', [UsersController::class, 'history'])
        ->name('users.history')
        ->middleware('can:users.index');

    // ROLES
    Route::resource('roles', RolesController::class)
        ->only(['index', 'edit', 'update', 'store'])
        ->middleware(['index' => 'can:roles.index']);


    // [CRUD_ROUTES_HERE]

});
