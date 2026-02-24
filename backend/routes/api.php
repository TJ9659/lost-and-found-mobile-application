<?php

use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ChatRoomController;
use App\Http\Controllers\ClaimController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ExchangeController;
use Illuminate\Foundation\Auth\EmailVerificationRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ItemController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\SemanticSearchController;
use App\Http\Controllers\VisionController;
use App\Models\User;
use App\Http\Controllers\UserController;
use App\Http\Controllers\UserDeviceController;

Route::get('/email/verify/{id}/{hash}', function (Request $request, $id, $hash) {
    $user = User::findOrFail($id);

    if (! hash_equals(sha1($user->email), $hash)) {
        return response()->view('email_verified', ['status' => 'invalid'], 403);
    }

    if (! $user->hasVerifiedEmail()) {
        $user->markEmailAsVerified();
    }

    return view('email_verified', ['status' => 'success']);
})->middleware('signed')->name('api.verification.verify');


Route::post('/resend-verification', function (Request $request) {
    $request->validate(['email' => 'required|email']);

    $user = User::where('email', $request->email)->first();

    if (! $user) {
        return response()->json(['message' => 'User not found.'], 404);
    }

    if ($user->hasVerifiedEmail()) {
        return response()->json(['message' => 'Email already verified.'], 400);
    }

    $user->sendEmailVerificationNotification();

    return response()->json([
        'message' => 'Verification email sent!'
    ]);
});

// Route::middleware('auth:sanctum')->post('/save-device-token', [UserDeviceController::class, 'saveToken']);




Route::middleware(['auth:sanctum'])->get('/user', function (Request $request) {
    return $request->user();
});

Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/email/verify', function (Request $request) {
        return $request->user()->hasVerifiedEmail()
            ? response()->json(['message' => 'Already verified'])
            : response()->json(['message' => 'Not verified'], 403);
    });
});

Route::get('/users/{id}', [UserController::class, 'show']);
// routes/api.php
Route::middleware('auth:sanctum')->get('/me', [UserController::class, 'me']);


// routes/api.php



// Semantic Search Route
Route::post('/semantic-search', [SemanticSearchController::class, 'search']);
Route::post('/vision/analyze', [VisionController::class, 'analyze']);


Route::middleware('auth:sanctum')->group(function () {

    Route::get('/dashboard', [DashboardController::class, 'index']);
    Route::get('/profile/edit', [UserController::class, 'edit'])->name('profile.edit');
    Route::put('/profile/update', [UserController::class, 'update']);
    
    // Item Routes
    // These routes handle the creation, listing, and updating of items
    Route::post('/items/create', [ItemController::class, 'store']);
    Route::get('/items/admin', [ItemController::class, 'adminItems']);
    Route::get('/items/admin/{id}', [ItemController::class, 'adminItemDetails']);
    Route::get('/items', [ItemController::class, 'index']);
    Route::get('/items/{id}', [ItemController::class, 'show']);
    Route::get('/items/edit/{item}', [ItemController::class, 'edit']);
    Route::put('/items/update/{id}', [ItemController::class, 'update']);
    Route::delete('/items/delete/{id}', [ItemController::class, 'destroy']);


    // Claim Routes
    // These routes handle the creation, listing, and updating of claims related to items
    Route::post('/claims', [ClaimController::class, 'store']);
    Route::get('/claims', [ClaimController::class, 'index']);
    Route::get('/claims/user/{userId}', [ClaimController::class, 'getUserClaims']);
    Route::patch('/claims/{id}', [ClaimController::class, 'update']);
    Route::get('/claims/owner', [ClaimController::class, 'getOwnerClaims']);
    Route::get('/claims/{id}', [ClaimController::class, 'show']);
    Route::get('/my-claims', [ClaimController::class, 'myClaims']);


    //Exchange
    Route::get('/exchanges', [ExchangeController::class, 'index']);
    Route::post('/exchanges/{claim}/confirm', [ExchangeController::class, 'confirm']);
    Route::post('/exchanges/{claim}/reject', [ExchangeController::class, 'reject']);
});

Route::get('/categories', [CategoryController::class, 'index']);

require __DIR__ . '/auth.php';
