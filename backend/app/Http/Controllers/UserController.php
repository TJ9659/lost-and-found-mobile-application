<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;

class UserController extends Controller
{
    public function show($id)
    {
        $user = User::with('reportedItems')->findOrFail($id);
        return response()->json($user);
    }

    public function me(Request $request)
    {
        return response()->json($request->user()->load('reportedItems'));
    }

    public function edit()
    {
        return response()->json(auth()->user());
    }

    public function update(Request $request)
    {
        $user = auth()->user();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'student_id' => 'nullable|string|max:20',
            'faculty' => 'required|string',
            'profile_pic' => 'nullable|image|mimes:jpg,jpeg,png,heic|max:2048',
            'password' => 'nullable|string|min:8|confirmed',
        ]);

        if (!empty($validated['password'])) {
            $user->password = bcrypt($validated['password']);
        }

        if ($request->boolean('remove_profile_pic')) {
            if ($user->profile_pic && $user->profile_pic !== 'images/default.png') {
                \Storage::disk('public')->delete($user->profile_pic);
            }
            $validated['profile_pic'] = 'images/default.png';
        }

        // Handle profile picture upload
        if ($request->hasFile('profile_pic')) {
            // Delete old pic if exists and not default
            if ($user->profile_pic && $user->profile_pic !== 'images/default.png') {
                \Storage::disk('public')->delete($user->profile_pic);
            }

            $filename = time() . '_' . $request->file('profile_pic')->getClientOriginalName();
            $path = $request->file('profile_pic')->storeAs('images', $filename, 'public');
            $validated['profile_pic'] = $path;
        }

        $user->update($validated);

        return response()->json([
            'message' => 'Profile updated successfully!',
            'user' => [
                ...$user->toArray(),
                'profile_pic_url' => asset('storage/' . ($user->profile_pic ?? 'images/default.png'))
            ]
        ]);
    }
}
