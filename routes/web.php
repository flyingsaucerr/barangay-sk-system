<?php

use Illuminate\Support\Facades\Route;

// Public page (React) - serve the React app for the home page
Route::get('/', function () {
    return view('app');
});

// COMMENT OUT or REMOVE the Laravel Breeze auth routes
// This is what's causing the Blade login to show up
// require __DIR__ . '/auth.php';

// REMOVE these admin routes - React will handle admin routes
// Route::middleware(['auth', 'role:admin'])->group(function () {
//     Route::get('/admin/dashboard', [AdminController::class, 'dashboard'])->name('admin.dashboard');
//     Route::get('/admin/accomplishments', [AdminController::class, 'accomplishments'])->name('admin.accomplishments');
//     Route::get('/admin/reports', [AdminController::class, 'reports'])->name('admin.reports');
//     Route::get('/admin/users', [AdminController::class, 'users'])->name('admin.users');
// });

// REMOVE these user profile routes - React will handle authentication
// Route::middleware('auth')->group(function () {
//     Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
//     Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
//     Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
// });

// Catch-all route for React - serve React app for ALL routes
// This will handle /admin/login and all other routes
Route::get('/{any}', function () {
    return view('app');
})->where('any', '.*');