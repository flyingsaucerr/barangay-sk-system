<?php
// app/Http/Controllers/AccomplishmentController.php

namespace App\Http\Controllers;

use App\Models\Accomplishment;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class AccomplishmentController extends Controller
{
    public function index()
    {
        try {
            $accomplishments = Accomplishment::orderBy('date_completed', 'desc')->get();
            return response()->json($accomplishments);
        } catch (\Exception $e) {
            Log::error('Error fetching accomplishments: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch accomplishments'], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            Log::info('Store method called', $request->all());
            
            $validator = Validator::make($request->all(), [
                'title' => 'required|string|max:255',
                'description' => 'nullable|string',
                'location' => 'nullable|string|max:255',
                'date_completed' => 'required|date',
                'photo' => 'nullable|image|max:5120',
                'project_id' => 'nullable|exists:projects,id',
            ]);

            if ($validator->fails()) {
                Log::error('Validation failed', $validator->errors()->toArray());
                return response()->json(['errors' => $validator->errors()], 422);
            }

            $data = $validator->validated();

            // Handle photo upload
            if ($request->hasFile('photo')) {
                $path = $request->file('photo')->store('accomplishments', 'public');
                $data['photo'] = $path;
                Log::info('Photo uploaded', ['path' => $path]);
            }
            // If this is from a project and no new photo was uploaded, try to copy the project image
            elseif ($request->has('project_id') && $request->project_id) {
                $project = Project::find($request->project_id);
                
                if ($project && $project->image) {
                    if (Storage::disk('public')->exists($project->image)) {
                        $extension = pathinfo($project->image, PATHINFO_EXTENSION);
                        $newFilename = 'accomplishments/' . uniqid() . '.' . $extension;
                        Storage::disk('public')->copy($project->image, $newFilename);
                        $data['photo'] = $newFilename;
                        Log::info('Project image copied', ['new_path' => $newFilename]);
                    }
                }
            }

            $accomplishment = Accomplishment::create($data);
            Log::info('Accomplishment created', ['id' => $accomplishment->id]);

            return response()->json($accomplishment, 201);
            
        } catch (\Exception $e) {
            Log::error('Error in store method: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            return response()->json(['error' => 'Failed to create accomplishment: ' . $e->getMessage()], 500);
        }
    }

    public function show(Accomplishment $accomplishment)
    {
        return response()->json($accomplishment);
    }

    public function update(Request $request, $id)
    {
        try {
            Log::info('Update method called', ['id' => $id, 'all_data' => $request->all()]);
            
            $accomplishment = Accomplishment::findOrFail($id);
            
            // Handle both PUT and POST with _method=PUT
            $validator = Validator::make($request->all(), [
                'title' => 'required|string|max:255',
                'description' => 'nullable|string',
                'location' => 'nullable|string|max:255',
                'date_completed' => 'required|date',
                'photo' => 'nullable|image|max:5120',
                'project_id' => 'nullable|exists:projects,id',
                'is_published' => 'sometimes|boolean',
            ]);

            if ($validator->fails()) {
                Log::error('Validation failed', $validator->errors()->toArray());
                return response()->json(['errors' => $validator->errors()], 422);
            }

            $data = $validator->validated();

            if ($request->hasFile('photo')) {
                // Delete old photo
                if ($accomplishment->photo) {
                    Storage::disk('public')->delete($accomplishment->photo);
                }
                $path = $request->file('photo')->store('accomplishments', 'public');
                $data['photo'] = $path;
                Log::info('New photo uploaded', ['path' => $path]);
            }

            // Handle is_published as boolean
            if ($request->has('is_published')) {
                $data['is_published'] = filter_var($request->input('is_published'), FILTER_VALIDATE_BOOLEAN);
            }

            $accomplishment->update($data);
            Log::info('Accomplishment updated', ['id' => $accomplishment->id]);

            return response()->json($accomplishment);
            
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            Log::error('Accomplishment not found', ['id' => $id]);
            return response()->json(['error' => 'Accomplishment not found'], 404);
        } catch (\Exception $e) {
            Log::error('Error in update method: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            return response()->json(['error' => 'Failed to update accomplishment: ' . $e->getMessage()], 500);
        }
    }

    public function destroy($id)
    {
        try {
            Log::info('Destroy method called', ['id' => $id]);
            
            $accomplishment = Accomplishment::findOrFail($id);

            // Delete photo if exists
            if ($accomplishment->photo) {
                Storage::disk('public')->delete($accomplishment->photo);
                Log::info('Photo deleted', ['path' => $accomplishment->photo]);
            }

            $accomplishment->delete();
            Log::info('Accomplishment deleted', ['id' => $id]);

            return response()->json(['message' => 'Accomplishment deleted successfully'], 200);
            
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            Log::error('Accomplishment not found for deletion', ['id' => $id]);
            return response()->json(['error' => 'Accomplishment not found'], 404);
        } catch (\Exception $e) {
            Log::error('Error in destroy method: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to delete accomplishment: ' . $e->getMessage()], 500);
        }
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
    
    public function publicIndex()
    {
        try {
            $accomplishments = Accomplishment::where('is_published', true)
                ->orderBy('date_completed', 'desc')
                ->get();
            return response()->json($accomplishments);
        } catch (\Exception $e) {
            Log::error('Error fetching public accomplishments: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch accomplishments'], 500);
        }
    }

    public function publicShow($id)
    {
        try {
            $accomplishment = Accomplishment::where('id', $id)
                ->where('is_published', true)
                ->firstOrFail();
            return response()->json($accomplishment);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['error' => 'Accomplishment not found'], 404);
        } catch (\Exception $e) {
            Log::error('Error fetching public accomplishment: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch accomplishment'], 500);
        }
    }
}