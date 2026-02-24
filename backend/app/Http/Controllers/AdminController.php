<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Item;
use App\Models\Claim;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class AdminController extends Controller
{
    public function dashboard()
    {
        $userCount      = User::count();
        $itemCount      = Item::count();
        $claimCount     = Claim::count();
        $pendingClaims  = Claim::where('status', 'pending')->count();
        $exchangedCount = Item::where('is_exchanged', true)->count();

        $recentUsers = User::latest()->take(10)->get();

        $lostItemsByMonth = Item::where('status', 'lost')
            ->select(DB::raw("DATE_FORMAT(created_at, '%Y-%m') as month"), DB::raw('count(*) as total'))
            ->groupBy('month')
            ->orderBy('month')
            ->pluck('total', 'month')
            ->toArray();

        $foundItemsByMonth = Item::where('status', 'found')
            ->select(DB::raw("DATE_FORMAT(created_at, '%Y-%m') as month"), DB::raw('count(*) as total'))
            ->groupBy('month')
            ->orderBy('month')
            ->pluck('total', 'month')
            ->toArray();

        $claimsByStatus = Claim::select('status', DB::raw('count(*) as total'))
            ->groupBy('status')
            ->pluck('total', 'status')
            ->toArray();

        $claimLabels = array_keys($claimsByStatus);
        $claimData   = array_values($claimsByStatus);

        $usersByMonth = User::select(DB::raw("DATE_FORMAT(created_at, '%Y-%m') as month"), DB::raw('count(*) as total'))
            ->groupBy('month')
            ->orderBy('month')
            ->pluck('total', 'month')
            ->toArray();

        $userLabels = array_keys($usersByMonth);
        $userData   = array_values($usersByMonth);


        $exchangesByMonth = Item::where('is_exchanged', true)
            ->select(DB::raw("DATE_FORMAT(updated_at, '%Y-%m') as month"), DB::raw('count(*) as total'))
            ->groupBy('month')
            ->orderBy('month')
            ->pluck('total', 'month')
            ->toArray();

        $exchangeLabels = array_keys($exchangesByMonth);
        $exchangeData   = array_values($exchangesByMonth);

        return view('admin.dashboard', compact(
            'userCount',
            'itemCount',
            'claimCount',
            'pendingClaims',
            'exchangedCount',
            'recentUsers',
            'lostItemsByMonth',
            'foundItemsByMonth',
            'claimLabels',
            'claimData',
            'userLabels',
            'userData',
            'exchangeLabels',
            'exchangeData'
        ));
    }


    public function editProfile()
    {
        $admin = Auth::user();
        return view('admin.profile.edit', compact('admin'));
    }

    public function updateProfile(Request $request)
    {
        $admin = auth()->user();

        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $admin->id,
            'profile_pic' => 'nullable|image|max:2048',
            'remove_image' => 'nullable|boolean',
        ]);

        if ($request->hasFile('profile_pic')) {
            if ($admin->profile_pic && Storage::disk('public')->exists($admin->profile_pic)) {
                Storage::disk('public')->delete($admin->profile_pic);
            }

            $path = $request->file('profile_pic')->store('images', 'public');
            $data['profile_pic'] = $path;
        } elseif ($request->boolean('remove_image')) {
            if ($admin->profile_pic && $admin->profile_pic !== 'images/default.png' && Storage::disk('public')->exists($admin->profile_pic)) {
                Storage::disk('public')->delete($admin->profile_pic);
            }
            $data['profile_pic'] = 'images/default.png';
        }


        $admin->update($data);

        return back()->with('success', 'Profile updated successfully!');
    }

    // Users
    public function users(Request $request)
    {

        $facultiesData = json_decode(Storage::disk('public')->get('json/faculties.json'), true);
        $faculties = [];
        foreach ($facultiesData as $f) {
            $faculties[$f['code']] = $f['name'];
        }
        $query = User::query()->where('id', '!=', auth()->id());

        if ($request->filled('keyword')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->keyword . '%')
                    ->orWhere('email', 'like', '%' . $request->keyword . '%');
            });
        }

        if ($request->filled('faculty')) {
            $query->where('faculty', $request->faculty);
        }

        if ($request->filled('role')) {
            $query->where('role', $request->role);
        }

        $users = $query->orderBy('id', 'desc')->paginate(10)->withQueryString();

        return view('admin.users.index', compact('users', 'faculties'));
    }



    public function editUser($id)
    {
        if ($id == auth()->id()) {
            return redirect()->route('admin.users')->with('error', 'You cannot edit your own account here.');
        }
        $user = User::findOrFail($id);
        return view('admin.users.edit', compact('user'));
    }

    public function updateUser(Request $request, $id)
    {
        if ($id == auth()->id()) {
            return redirect()->route('admin.users')->with('error', 'You cannot edit your own account here.');
        }
        $user = User::findOrFail($id);
        $user->update($request->only(['name', 'email', 'faculty', 'role']));
        return redirect()->route('admin.users')->with('success', 'User updated.');
    }

    public function deleteUser($id)
    {
        User::findOrFail($id)->delete();
        return redirect()->route('admin.users')->with('success', 'User deleted.');
    }

    // Items
    public function items(Request $request)
    {
        $categories = Category::all();

        $query = Item::with('owner')->where('in_transaction', '==', false)->where('is_claimed', '==', true)->where('is_exchanged', '==', false);;;

        if ($request->filled('q')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->q . '%')
                    ->orWhere('description', 'like', '%' . $request->q . '%');
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        $items = $query->paginate(20)->withQueryString(); // paginate + keep query string

        return view('admin.items.index', compact('items', 'categories'));
    }


    public function createItem()
    {
        $categories = Category::all();
        return view('admin.items.create', compact('categories'));
    }

    public function storeItem(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'required|in:lost,found',
            'building' => 'required|string',
            'floor' => 'required|string',
            'location' => 'required|string',
            'category_id' => 'required',
            'image' => 'nullable|image|max:2048', // max 2MB
        ]);

        $data = $request->only(['name', 'description', 'status', 'building', 'floor', 'location', 'category_id']);
        $data['user_id'] = auth()->id();
        $data['non_claimable'] = true;

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('images', 'public');
            $data['image_path'] = $path;
        } else {
            $data['image_path'] = 'images/default-image.png'; // default image
        }

        Item::create($data);

        return redirect()->route('admin.items')->with('success', 'Item created successfully.');
    }



    public function editItem($id)
    {
        $item = Item::findOrFail($id);
        $categories = Category::all();
        return view('admin.items.edit', compact('item', 'categories'));
    }

    public function updateItem(Request $request, $id)
    {
        $item = Item::findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'required|in:lost,found',
            'building' => 'required|string',
            'floor' => 'required|string',
            'location' => 'required|string',
            'category_id' => 'required',
            'image' => 'nullable|image|max:2048',
            'remove_image' => 'nullable|boolean',
        ]);

        $data = $request->only(['name', 'description', 'status', 'building', 'floor', 'location', 'category_id']);

        if ($request->hasFile('image')) {
            if ($item->image_path && Storage::disk('public')->exists($item->image_path)) {
                Storage::disk('public')->delete($item->image_path);
            }
            $path = $request->file('image')->store('images', 'public');
            $data['image_path'] = $path;
        } elseif ($request->has('remove_image')) {
            if ($item->image_path && Storage::disk('public')->exists($item->image_path)) {
                Storage::disk('public')->delete($item->image_path);
            }
            $data['image_path'] = 'images/default-image.png'; // use default
        }

        $item->update($data);

        return redirect()->route('admin.items')->with('success', 'Item updated successfully.');
    }


    public function markClaimed($id)
    {
        $item = Item::findOrFail($id);

        $item->claims()->create([
            'claimer_id' => auth()->id(),
            'approved_by' => auth()->id(),
            'message' => 'Handed over physically at the Admin Office.',
            'location_detail' => 'Admin Desk',
            'datetime_detail' => now(),
            'status' => 'approved',
            'exchanged' => true,
            'exchanged_at' => now(),
            'approved_at' => now(),
        ]);

        $item->update([
            'is_claimed' => true,
            'is_exchanged' => true,
        ]);

        return back()->with('success', 'Item successfully marked as claimed and removed from active list.');
    }


    public function deleteItem($id)
    {
        Item::findOrFail($id)->delete();
        return redirect()->route('admin.items')->with('success', 'Item deleted.');
    }

    public function claims(Request $request)
    {
        $query = Claim::with(['item', 'claimer']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('keyword')) {
            $keyword = $request->keyword;
            $query->whereHas('item', fn($q) => $q->where('name', 'like', "%{$keyword}%"))
                ->orWhereHas('claimer', fn($q) => $q->where('name', 'like', "%{$keyword}%"));
        }

        $claims = $query->latest()->paginate(20)->withQueryString();

        return view('admin.claims.index', compact('claims'));
    }



    public function approveClaim($id)
    {
        $claim = Claim::findOrFail($id);
        $claim->status = 'approved';
        $claim->approved_by = auth()->id();
        $claim->approved_at = now();
        $claim->save();

        $claim->item->is_claimed = true;
        $claim->item->claimed_by = $claim->claimer_id;
        $claim->item->save();

        return redirect()->route('admin.claims')->with('success', 'Claim approved.');
    }

    public function rejectClaim($id)
    {
        $claim = Claim::findOrFail($id);
        $claim->status = 'rejected';
        $claim->rejected_at = now();
        $claim->save();

        return redirect()->route('admin.claims')->with('success', 'Claim rejected.');
    }

    public function deleteClaim($id)
    {
        $claim = Claim::with('item')->findOrFail($id);

        // If the claim was approved, reset the item's status
        if ($claim->status === 'approved') {
            $item = $claim->item;
            $item->is_exchanged = false;
            $item->in_transaction = false;
            $item->is_claimed = false;
            $item->claimed_by = null;
            $item->save();
        }

        $claim->delete();

        return redirect()->route('admin.claims')->with('success', 'Claim deleted. Item is now available if it was approved.');
    }

    // Exchanges
    public function exchanges()
    {
        $exchanges = Claim::with('item.owner', 'claimer')
            ->where('status', 'approved')
            ->where('exchanged', 1)
            ->latest()
            ->get();


        return view('admin.exchanges.index', compact('exchanges'));
    }



    public function confirmExchange($id)
    {
        $item = Item::findOrFail($id);
        $item->is_exchanged = true;
        $item->save();
        return redirect()->route('admin.exchanges')->with('success', 'Exchange confirmed.');
    }

    public function rollbackExchange($claimId)
    {
        $claim = Claim::with('item')->findOrFail($claimId);

        if ($claim->exchanged) {
            // Mark claim as rolled back, but keep it in DB
            $claim->exchanged = false;
            $claim->exchanged_at = null;
            $claim->status = 'rolled_back';
            $claim->save();

            $item = $claim->item;
            $item->is_exchanged = false;
            $item->in_transaction = false;
            $item->is_claimed = false;
            $item->claimed_by = null;
            $item->save();

            return redirect()->route('admin.exchanges')
                ->with('success', 'Exchange rolled back. Item is available for new claims.');
        }

        return redirect()->route('admin.exchanges')
            ->with('error', 'This claim cannot be rolled back.');
    }

    public function showUser($id)
    {
        $user = User::findOrFail($id);
        return view('admin.users.show', compact('user'));
    }

    public function showItem($id)
    {
        $item = Item::with('owner', 'claims')->findOrFail($id);
        return view('admin.items.show', compact('item'));
    }

    public function showClaim($id)
    {
        $claim = Claim::with('item', 'claimer')->findOrFail($id);
        return view('admin.claims.show', compact('claim'));
    }
}
