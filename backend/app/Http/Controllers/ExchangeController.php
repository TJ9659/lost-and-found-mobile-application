<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Claim;
use Illuminate\Support\Facades\Auth;

class ExchangeController extends Controller
{
    // List all claims related to current user's items
    public function index()
    {
        $userId = Auth::id();

        $claims = Claim::with('item', 'claimer')
            ->whereHas('item', fn($q) => $q->where('user_id', $userId))
            ->orderBy('created_at', 'desc')
            ->get();

        $claims->each(fn($claim) => $claim->canConfirmExchange = ($claim->status === 'approved' && !$claim->exchanged));

        return response()->json($claims);
    }

    // confirm exchange only if claim is approved
    public function confirm(Claim $claim)
    {
        $userId = Auth::id();

        if ($claim->item->user_id !== $userId) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        if ($claim->status !== 'approved') {
            return response()->json(['error' => 'Claim not approved'], 400);
        }

        if ($claim->exchanged) {
            return response()->json(['error' => 'Already exchanged'], 400);
        }

        $claim->exchanged = true;
        $claim->exchanged_at = now();
        $claim->save();

        $claim->item->in_transaction = false;
        $claim->item->claimed_by = $claim->claimer_id;
        $claim->item->is_exchanged = true;
        $claim->item->save();

        return response()->json($claim);
    }

    // Reject claim (status = rejected)
    public function reject(Claim $claim)
    {
        $userId = Auth::id();

        if ($claim->item->user_id !== $userId) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $claim->status = 'rejected';
        $claim->rejected_at = now();
        $claim->exchanged = false;
        $claim->save();

        $claim->item->in_transaction = false;
        $claim->item->claimed_by = null;
        $claim->item->save();

        return response()->json($claim);
    }
}
