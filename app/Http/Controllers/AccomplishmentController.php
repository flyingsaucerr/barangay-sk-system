<?php
// app/Http/Controllers/AccomplishmentController.php

namespace App\Http\Controllers;

use App\Models\Accomplishment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AccomplishmentController extends Controller
{
    public function index()
    {
        $accomplishments = Accomplishment::orderBy('date_completed', 'desc')->get();
        return response()->json($accomplishments);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'location' => 'nullable|string|max:255',
            'date_completed' => 'required|date',
            'photo' => 'nullable|image|max:5120', // 5MB max
        ]);

        if ($request->hasFile('photo')) {
            $validated['photo'] = $request->file('photo')->store('accomplishments', 'public');
        }

        $accomplishment = Accomplishment::create($validated);

        return response()->json($accomplishment, 201);
    }

    public function show(Accomplishment $accomplishment)
    {
        return response()->json($accomplishment);
    }

    public function update(Request $request, Accomplishment $accomplishment)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'location' => 'nullable|string|max:255',
            'date_completed' => 'required|date',
            'photo' => 'nullable|image|max:5120',
        ]);

        if ($request->hasFile('photo')) {
            // Delete old photo
            if ($accomplishment->photo) {
                Storage::disk('public')->delete($accomplishment->photo);
            }
            $validated['photo'] = $request->file('photo')->store('accomplishments', 'public');
        }

        $accomplishment->update($validated);

        return response()->json($accomplishment);
    }

    public function destroy(Accomplishment $accomplishment)
    {
        // Delete photo if exists
        if ($accomplishment->photo) {
            Storage::disk('public')->delete($accomplishment->photo);
        }

        $accomplishment->delete();

        return response()->json(null, 204);
    }

    public function publish(Accomplishment $accomplishment)
    {
        $accomplishment->update(['is_published' => true]);
        return response()->json($accomplishment);
    }

    public function unpublish(Accomplishment $accomplishment)
    {
        $accomplishment->update(['is_published' => false]);
        return response()->json($accomplishment);
    }

    // Public routes
    public function publicIndex()
    {
        $accomplishments = Accomplishment::where('is_published', true)
            ->orderBy('date_completed', 'desc')
            ->get();
        return response()->json($accomplishments);
    }

    public function publicShow(Accomplishment $accomplishment)
    {
        if (!$accomplishment->is_published) {
            abort(404);
        }
        return response()->json($accomplishment);
    }
}