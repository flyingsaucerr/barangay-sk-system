<?php

namespace App\Http\Controllers;

use App\Models\Facility;
use Illuminate\Http\Request;

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
        ]);

        $facility = Facility::create([
            'name' => $request->name,
            'description' => $request->description,
            'capacity' => $request->capacity,
            'location' => $request->location,
            'hours' => $request->hours,
            'status' => $request->status,
            'amenities' => $request->amenities,
        ]);

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
        ]);

        $facility->update([
            'name' => $request->name,
            'description' => $request->description,
            'capacity' => $request->capacity,
            'location' => $request->location,
            'hours' => $request->hours,
            'status' => $request->status,
            'amenities' => $request->amenities,
        ]);

        return response()->json($facility);
    }

    public function destroy($id)
    {
        $facility = Facility::findOrFail($id);
        $facility->delete();

        return response()->json(['message' => 'Facility deleted successfully']);
    }
}