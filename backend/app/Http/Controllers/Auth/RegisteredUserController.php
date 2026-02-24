<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Rules\SpecificDomainsOnly;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Illuminate\Http\JsonResponse;

class RegisteredUserController extends Controller
{
    /**
     * Handle an incoming registration request.
     */
    public function store(Request $request): JsonResponse
    {
        // Validation
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'string',
                'lowercase',
                'email',
                'max:255',
                'unique:' . User::class,
                new SpecificDomainsOnly
            ],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'student_id' => ['nullable', 'string', 'max:7'],   // optional
            'faculty' => ['required', 'string', 'max:100'],     // must select
        ]);

        // Create user
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'student_id' => $request->student_id ?? null,
            'faculty' => $request->faculty,
        ]);

        // Send email verification notification
        event(new Registered($user));

        return response()->json([
            'message' => 'Registration successful',
            'user' => $user,
            'token' => $user->createToken('auth_token')->plainTextToken,
        ], 201);
    }
}
