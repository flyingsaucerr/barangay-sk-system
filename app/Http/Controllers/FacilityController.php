<?php

namespace App\Http\Controllers;

use App\Models\Facility;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class FacilityController extends Controller
{
    public function index()
    {
        $facilities = Facility::latest()->get();
        return response()->json($facilities);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'capacity' => 'required|integer',
            'location' => 'required|string|max:255',
            'hours' => 'required|string|max:255',
            'status' => 'required|in:available,maintenance,booked,reserved',
            'amenities' => 'nullable|array',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048', // Add image validation
        ]);

        $data = [
            'name' => $request->name,
            'description' => $request->description,
            'capacity' => $request->capacity,
            'location' => $request->location,
            'hours' => $request->hours,
            'status' => $request->status,
            'amenities' => $request->amenities,
        ];

        // Handle image upload
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('facilities', 'public');
            $data['image'] = $imagePath;
        }

        $facility = Facility::create($data);

        return response()->json($facility, 201);
    }

    public function show($id)
    {
        $facility = Facility::findOrFail($id);
        return response()->json($facility);
    }

    public function update(Request $request, $id)
    {
        $facility = Facility::findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'capacity' => 'required|integer',
            'location' => 'required|string|max:255',
            'hours' => 'required|string|max:255',
            'status' => 'required|in:available,maintenance,booked,reserved',
            'amenities' => 'nullable|array',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048', // Add image validation
        ]);

        $data = [
            'name' => $request->name,
            'description' => $request->description,
            'capacity' => $request->capacity,
            'location' => $request->location,
            'hours' => $request->hours,
            'status' => $request->status,
            'amenities' => $request->amenities,
        ];

        // Handle image upload
        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($facility->image) {
                Storage::disk('public')->delete($facility->image);
            }
            
            $imagePath = $request->file('image')->store('facilities', 'public');
            $data['image'] = $imagePath;
        }

        $facility->update($data);

        return response()->json($facility);
    }

    public function destroy($id)
    {
        $facility = Facility::findOrFail($id);
        
        // Delete image file if exists
        if ($facility->image) {
            Storage::disk('public')->delete($facility->image);
        }
        
        $facility->delete();

        return response()->json(['message' => 'Facility deleted successfully']);
    }
}