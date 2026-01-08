<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\RouteController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // API Routes for Direction Map
    Route::get('/api/routes', [RouteController::class, 'index']);
    Route::post('/api/routes', [RouteController::class, 'store']);

    // ADDED: Update route for Edit functionality
    Route::put('/api/routes/{route}', [RouteController::class, 'update']);

    Route::delete('/api/routes/{route}', [RouteController::class, 'destroy']);
    Route::post('/api/routes/bulk-delete', [RouteController::class, 'bulkDestroy']);
});

require __DIR__.'/auth.php';
