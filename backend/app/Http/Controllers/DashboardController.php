<?php

namespace App\Http\Controllers;

use App\Models\Claim;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();


        $pendingClaims = Claim::where('status', 'pending')
            ->whereIn('item_id', function ($q) use ($user) {
                $q->select('id')->from('items')->where('user_id', $user->id);
            })->count();

        $acceptedClaims = Claim::where('status', 'approved') // make sure it's 'accepted' or 'approved'
            ->whereIn('item_id', function ($q) use ($user) {
                $q->select('id')->from('items')->where('user_id', $user->id);
            })->count();

        $pendingExchanges = Claim::where('status', 'approved')
            ->whereNull('exchanged_at')
            ->whereIn('item_id', function ($q) use ($user) {
                $q->select('id')->from('items')->where('user_id', $user->id);
            })->count();

        return response()->json([
            'pendingClaims' => $pendingClaims,
            'acceptedClaims' => $acceptedClaims,
            'pendingExchanges' => $pendingExchanges,
        ]);
    }
}
