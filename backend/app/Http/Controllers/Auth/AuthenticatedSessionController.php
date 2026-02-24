<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthenticatedSessionController extends Controller
{
    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request)
    {
        $request->authenticate();
        $user = $request->user();

        if (!$user->hasVerifiedEmail()) {
            $message = 'Your email is not verified. Please check your inbox.';
            if ($request->wantsJson()) {
                return response()->json([
                    'message' => $message,
                    'resend_verification_url' => route('verification.send'),
                ], 403);
            } else {
                return back()->withErrors(['email' => $message]);
            }
        }

        // Mobile/API request: return token
        if ($request->wantsJson()) {
            return response()->json([
                'user' => $user,
                'token' => $user->createToken('auth_token')->plainTextToken,
                'message' => 'Login successful',
            ]);
        }

        // Web request: use session-based login
        Auth::login($user);
        $request->session()->regenerate();

        return redirect()->intended('/admin/dashboard'); // redirect to admin panel
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request)
    {
        if ($request->wantsJson()) {
            // Mobile: delete token
            $request->user()->tokens()->delete();

            return response()->json([
                'message' => 'Successfully logged out'
            ]);
        }

        // Web: logout and invalidate session
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/login'); // redirect to login page
    }
}
