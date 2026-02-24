<?php

namespace App\Http\Controllers;

use App\Helpers\VisionHelper;
use App\Models\Item;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;

class ItemController extends Controller
{

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'image' => 'required|image|max:2048',
            'description' => 'required|string',
            'status' => 'required|in:lost,found',
            'building' => 'required|in:KA,KB',
            'floor' => 'required|string|max:255',
            'location' => 'required|string|max:255',
            'category_id' => 'required',
        ]);

        $imagePath = $request->file('image')->store('items', 'public');

        $item = Item::create([
            'name' => $request->name,
            'description' => $request->description,
            'tags' => $request->tags,
            'image_path' => $imagePath,
            'status' => $request->status,
            'building' => $request->building,
            'floor' => $request->floor,
            'location' => $request->location,
            'category_id' => $request->category_id,
            'user_id' => Auth::id(),
        ]);

        return response()->json([
            'message' => 'Item reported successfully.',
            'item' => $item,
        ], 201);
    }


    public function index(Request $request)
    {
        $query = Item::with('user', 'category')->where('in_transaction', false)
            ->where('is_exchanged', false)
            ->where('non_claimable', false) // only user items
            ->when($request->status, fn($q, $status) => $q->where('status', $status))
            ->when($request->category, fn($q, $category) => $q->where('category_id', $category))
            ->when($request->building, fn($q, $building) => $q->where('building', $building))
            ->when($request->floor, fn($q, $floor) => $q->where('floor', $floor))
            ->when($request->location, fn($q, $location) => $q->where('location', $location))
            ->when($request->search, fn($q, $search) => $q->where('name', 'like', "%{$search}%"));

        $items = $query
            ->when($request->oldest, fn($q) => $q->oldest(), fn($q) => $q->latest())
            ->paginate(10);

        return response()->json($items);
    }

    public function edit(Item $item)
    {
        $item->load('category');

        return response()->json($item);
    }

    public function show($id)
    {
        $userId = auth()->id();

        $item = Item::with([
            'user',
            'category',
            'claims' => function ($query) use ($userId) {
                $query->where('claimer_id', $userId);
            }
        ])->findOrFail($id);

        return $item;
    }



    public function update(Request $request, $id)
    {
        $item = Item::findOrFail($id);
        if ($item->user_id !== Auth::id()) {
            return response()->json([
                'message' => 'Unauthorized to update this item'
            ], 403);
        }

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'description' => 'sometimes|nullable|string',
            'status' => 'sometimes|required|in:lost,found',
            'location' => 'sometimes|required|string|max:255',
            'building' => 'sometimes|required|in:KA,KB',
            'floor' => 'sometimes|required|string',
            'category_id' => 'sometimes|required',
            'image' => 'sometimes|image|max:2048',
            'tags' => 'sometimes|nullable',
        ]);

        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('items', 'public');
            $validated['image_path'] = $imagePath;
        }

        if (isset($validated['tags'])) {
            $validated['tags'] = json_encode($validated['tags']);
        }

        $item->update($validated);

        return response()->json($item);
    }


    public function destroy($id)
    {
        $item = Item::findOrFail($id);

        if ($item->user_id !== Auth::id()) {
            return response()->json([
                'message' => 'Unauthorized to delete this item'
            ], 403);
        }

        if ($item->in_transaction || $item->is_exchanged) {
            return response()->json([
                'message' => 'Cannot delete item involved in a transaction'
            ], 400);
        }

        $item->delete();

        return response()->json([
            'message' => 'Item deleted successfully'
        ], 200);
    }

    public function adminItems(Request $request)
    {

        $items = Item::where('non_claimable', true)   // only admin items
            ->where('in_transaction', false)         // not in transaction
            ->where('is_exchanged', false)          // not exchanged
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($items);
    }

    public function adminItemDetails($id)
    {
        // Only fetch items that are admin items (non_claimable, not in transaction/exchanged)
        $item = Item::where('id', $id)
            ->where('non_claimable', true)
            ->where('in_transaction', false)
            ->where('is_exchanged', false)
            ->with('user') // include uploader info
            ->first();

        if (!$item) {
            return response()->json([
                'message' => 'Item not found or not accessible as admin item'
            ], 404);
        }

        return response()->json($item);
    }
}
