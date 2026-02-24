<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AdminMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        if (!Auth::check()) {
            // Not logged in → redirect to admin login
            return redirect()->route('admin.login.form');
        }

        if (Auth::user()->role !== 'admin') {
            // Logged in but not admin → 403
            abort(403, 'Unauthorized');
        }

        return $next($request);
    }
}
