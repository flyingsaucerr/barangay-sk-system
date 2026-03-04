<?php
// app/Http/Controllers/AccomplishmentController.php

namespace App\Http\Controllers;

use App\Models\Accomplishment;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class AccomplishmentController extends Controller
{
    public function index()
    {
        $accomplishments = Accomplishment::orderBy('date_completed', 'desc')->get();
        return response()->json($accomplishments);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'location' => 'nullable|string|max:255',
            'date_completed' => 'required|date',
            'photo' => 'nullable|image|max:5120', // 5MB max
            'project_id' => 'nullable|exists:projects,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $validated = $validator->validated();

        // Handle photo upload
        if ($request->hasFile('photo')) {
            $validated['photo'] = $request->file('photo')->store('accomplishments', 'public');
        }
        // If this is from a project and no new photo was uploaded, try to copy the project image
        elseif ($request->has('project_id')) {
            $project = Project::find($request->project_id);
            
            if ($project && $project->image) {
                // Check if the project image exists in storage
                if (Storage::disk('public')->exists($project->image)) {
                    // Get the file extension
                    $extension = pathinfo($project->image, PATHINFO_EXTENSION);
                    
                    // Generate a new filename for the accomplishment
                    $newFilename = 'accomplishments/' . uniqid() . '.' . $extension;
                    
                    // Copy the file to the accomplishments directory
                    Storage::disk('public')->copy($project->image, $newFilename);
                    
                    $validated['photo'] = $newFilename;
                }
            }
        }

        // Add project_id to the record if it exists
        if ($request->has('project_id')) {
            $validated['project_id'] = $request->project_id;
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
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'location' => 'nullable|string|max:255',
            'date_completed' => 'required|date',
            'photo' => 'nullable|image|max:5120',
            'project_id' => 'nullable|exists:projects,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $validated = $validator->validated();

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