<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class UsersController extends Controller
{

    public function index()
    {
        return Inertia::render('Admin/Users/Index', [
            'users' => User::latest()->get()
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'role' => 'required|in:admin,staff',
            'password' => 'required|string|min:8',
            'avatar' => 'nullable|image|max:2048', // Max 2MB
        ]);

        if ($request->hasFile('avatar')) {
            $path = $request->file('avatar')->store('avatars', 'public');
            $validated['avatar'] = $path;
        }

        $validated['password'] = Hash::make($validated['password']);
        User::create($validated);

        return back();
    }

    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $user->id,
            'role' => 'required|in:admin,staff,viewer',
            'password' => 'nullable|string|min:8',
            'avatar' => 'nullable|image|max:2048',
        ]);

        if ($request->hasFile('avatar')) {
            // Hapus avatar lama jika ada
            if ($user->avatar) Storage::disk('public')->delete($user->avatar);

            $path = $request->file('avatar')->store('avatars', 'public');
            $validated['avatar'] = $path;
        }


        if (!empty($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        $user->update($validated);
        return back();
    }
}
