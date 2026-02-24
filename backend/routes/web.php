<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\AdminAuthController;
use App\Http\Controllers\Auth\NewPasswordController;
use App\Http\Middleware\AdminMiddleware;
use Illuminate\Support\Facades\Route;

Route::get('/', fn() => redirect()->route('admin.login.form'));

Route::prefix('admin')->group(function () {
    Route::get('/login', [AdminAuthController::class, 'showLoginForm'])->name('admin.login.form');
    Route::post('/login', [AdminAuthController::class, 'login'])->name('admin.login');
    Route::post('/logout', [AdminAuthController::class, 'logout'])->name('admin.logout');

    Route::middleware(['auth', 'admin'])->group(function () {
        Route::get('/profile', [AdminController::class, 'editProfile'])->name('admin.profile.edit');
        Route::post('/profile', [AdminController::class, 'updateProfile'])->name('admin.profile.update');
    });

    Route::middleware([
        'auth',
        'admin',
    ])->group(function () {
        Route::get('/dashboard', [AdminController::class, 'dashboard'])->name('admin.dashboard');

        Route::prefix('users')->group(function () {
            Route::get('/', [AdminController::class, 'users'])->name('admin.users');
            Route::get('/{id}', [AdminController::class, 'showUser'])->name('admin.users.show');
            Route::get('/{id}/edit', [AdminController::class, 'editUser'])->name('admin.users.edit');
            Route::put('/{id}', [AdminController::class, 'updateUser'])->name('admin.users.update');
            Route::delete('/{id}', [AdminController::class, 'deleteUser'])->name('admin.users.delete');
        });

        Route::prefix('items')->group(function () {
            Route::get('/', [AdminController::class, 'items'])->name('admin.items');
            Route::get('/create', [AdminController::class, 'createItem'])->name('admin.items.create');
            Route::post('/', [AdminController::class, 'storeItem'])->name('admin.items.store');
            Route::get('/{id}', [AdminController::class, 'showItem'])->name('admin.items.show');
            Route::get('/{id}/edit', [AdminController::class, 'editItem'])->name('admin.items.edit');
            Route::put('/{id}', [AdminController::class, 'updateItem'])->name('admin.items.update');
            Route::delete('/{id}', [AdminController::class, 'deleteItem'])->name('admin.items.delete');
            Route::patch('/{id}/mark-claimed', [AdminController::class, 'markClaimed'])->name('admin.items.mark-claimed');
        });

        Route::prefix('claims')->group(function () {
            Route::get('/', [AdminController::class, 'claims'])->name('admin.claims');
            Route::get('/{id}', [AdminController::class, 'showClaim'])->name('admin.claims.show');
            Route::post('/{id}/approve', [AdminController::class, 'approveClaim'])->name('admin.claims.approve');
            Route::post('/{id}/reject', [AdminController::class, 'rejectClaim'])->name('admin.claims.reject');
            Route::delete('/{id}', [AdminController::class, 'deleteClaim'])->name('admin.claims.delete');
        });

        Route::prefix('exchanges')->group(function () {
            Route::get('/', [AdminController::class, 'exchanges'])->name('admin.exchanges');
            Route::post('/{id}/confirm', [AdminController::class, 'confirmExchange'])->name('admin.exchanges.confirm');
            Route::post('/{id}/rollback', [AdminController::class, 'rollbackExchange'])->name('admin.exchanges.rollback');
        });
    });
});

Route::get('/password-reset/{token}', fn($token) => view('auth.reset-password', ['token' => $token]))
    ->name('password.reset');

Route::post('/reset-password', [NewPasswordController::class, 'store'])
    ->middleware('guest')
    ->name('password.store');
