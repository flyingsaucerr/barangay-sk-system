<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class RegisterController extends Controller
{
    public function register(Request $request)
    {
        try {
            // Validate the request
            $validated = $request->validate([
                'username' => 'required|string|max:255|unique:users',
                'password' => 'required|string|min:6|confirmed', // This requires password_confirmation
                'name' => 'required|string|max:255',
                'contact_number' => 'nullable|string|max:20',
                'organization' => 'nullable|string|max:255',
                'role' => 'required|in:admin,staff',
            ]);

            // Create the user
            $user = User::create([
                'username' => $validated['username'],
                'password' => Hash::make($validated['password']),
                'name' => $validated['name'],
                'contact_number' => $validated['contact_number'] ?? null,
                'organization' => $validated['organization'] ?? null,
                'role' => $validated['role'],
            ]);

            // Optionally create token for auto-login
            $token = $user->createToken('api-token')->plainTextToken;

            return response()->json([
                'success' => true,
                'message' => 'Registration successful!',
                'token' => $token,
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'username' => $user->username,
                    'role' => $user->role,
                    'contact_number' => $user->contact_number,
                    'organization' => $user->organization,
                ]
            ], 201);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        }
    }
}