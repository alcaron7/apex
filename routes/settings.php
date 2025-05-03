<?php

use App\Http\Controllers\Settings\PasswordController;
use App\Http\Controllers\Settings\ProfileController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware('auth')->group(function () {
    Route::redirect('parameters', 'parameters/profile');

    Route::get('parameters/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('parameters/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('parameters/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('parameters/password', [PasswordController::class, 'edit'])->name('password.edit');
    Route::put('parameters/password', [PasswordController::class, 'update'])->name('password.update');

    Route::get('parameters/appearance', function () {
        return Inertia::render('parameters/appearance');
    })->name('appearance');
});
