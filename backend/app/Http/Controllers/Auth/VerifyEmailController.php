<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Auth\Events\Verified;
use Illuminate\Foundation\Auth\EmailVerificationRequest;
use Illuminate\Http\RedirectResponse;

class VerifyEmailController extends Controller
{
    /**
     * Mark the authenticated user's email address as verified.
     */
    public function __invoke(EmailVerificationRequest $request): RedirectResponse
    {
        // Use the logged-in user if available, otherwise find by ID from URL
        $user = $request->user() ?? \App\Models\User::findOrFail($request->route('id'));

        if ($user->hasVerifiedEmail()) {
            return redirect()->intended(config('app.frontend_url') . '/dashboard?verified=1');
        }

        if (!$user->hasVerifiedEmail()) {
            $user->markEmailAsVerified();
            event(new Verified($user));
        }

        return redirect()->intended(config('app.frontend_url') . '/dashboard?verified=1');
    }
}
