<?php

namespace App\Http\Controllers;

use App\Models\Item;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Claim;




class ClaimController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'item_id' => 'required|exists:items,id',
            'message' => 'nullable|string|max:1000',
            'location_detail' => 'nullable|string|max:255',
            'datetime_detail' => 'nullable|date',
            'proof_image' => 'nullable|image|max:4096',
        ]);

        $item = Item::findOrFail($validated['item_id']);
        if ($item->user_id === Auth::id()) {
            return response()->json(['message' => 'You cannot claim your own item.'], 403);
        }

        if ($item->in_transaction || $item->is_exchanged || $item->non_claimable) {
            return response()->json(['message' => 'This item is not claimable.'], 400);
        }

        $validated['claimer_id'] = Auth::id();

        if ($request->hasFile('proof_image')) {
            $validated['proof_image_path'] = $request->file('proof_image')->store('proofs', 'public');
        }

        $claim = Claim::create($validated);

        $claim = Claim::with([
            'item.user', // item + owner
            'claimer'    // user who claims
        ])->find($claim->id);

        return response()->json($claim, 201);
    }




    public function index(Request $request)
    {
        $query = Claim::query()->with('item', 'claimer');

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('item_id')) {
            $query->where('item_id', $request->item_id);
        }

        return response()->json($query->paginate(10));
    }

    public function update(Request $request, $id)
    {
        $claim = Claim::with('item')->findOrFail($id);

        // only item owner or admin can approve/reject
        if (!Auth::user()->is_admin && Auth::id() !== $claim->item->user_id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $request->validate([
            'status' => 'required|in:approved,rejected',
        ]);

        $claim->status = $request->status;
        $claim->approved_by = Auth::id();

        $roomId = null;

        if ($request->status === 'approved') {
            $claim->approved_at = now();
            $claim->item->update([
                'in_transaction' => true,
                'is_claimed' => true,
                'claimed_by' => $claim->claimer_id
            ]);

            // reject all other claims for the same item
            Claim::where('item_id', $claim->item_id)
                ->where('id', '!=', $claim->id)
                ->update(['status' => 'rejected', 'rejected_at' => now()]);
        }


        $claim->save();

        return response()->json([
            'message' => 'Claim status updated.',
            'claim' => $claim,
            'roomId' => $roomId,
        ]);
    }



    public function show($id)
    {
        $claim = Claim::with([
            'item',       // the full item
            'item.user',  // owner of the item
            'claimer'     // user who claims
        ])->findOrFail($id);

        return response()->json($claim);
    }

    public function getUserClaims($userId)
    {
        $claims = Claim::where('claimer_id', $userId)->with('item')->get();

        return response()->json([
            'claims' => $claims
        ]);
    }

    public function confirmTransaction($claimId)
    {
        $claim = Claim::findOrFail($claimId);

        if ($claim->status !== 'approved') {
            return response()->json(['error' => 'Claim not in approved state'], 400);
        }

        $claim->status = 'completed';
        $claim->item->in_transaction = false;
        $claim->item->save();
        $claim->save();

        return response()->json(['message' => 'Transaction completed successfully']);
    }


    public function getOwnerClaims(Request $request)
    {
        $status = $request->query('status');
        $ownerId = auth()->id();

        $claims = Claim::with(['item', 'claimer'])
            ->whereHas('item', function ($query) use ($ownerId) {
                $query->where('user_id', $ownerId);
            })
            ->when($status, function ($query) use ($status) {
                $query->where('status', $status);
            })
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($claims);
    }

    // In ClaimController
    public function myClaims()
    {
        return Claim::with('item')
            ->where('claimer_id', auth()->id())
            ->orderByDesc('created_at')
            ->get();
    }
}
