<?php
// app/Http/Controllers/ProjectController.php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Accomplishment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class ProjectController extends Controller
{
    public function index()
    {
        $projects = Project::with('user')->latest()->get();
        return response()->json($projects);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'full_description' => 'nullable|string',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'status' => 'required|in:planning,ongoing,completed,cancelled',
            'location' => 'required|string|max:255',
            'beneficiaries' => 'required|integer|min:0',
            'progress' => 'required|integer|min:0|max:100',
            'category' => 'required|in:Infrastructure,Education,Environment,Sports,Health,Social Services',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        $data = [
            'title' => $request->title,
            'description' => $request->description,
            'full_description' => $request->full_description,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'status' => $request->status,
            'location' => $request->location,
            'beneficiaries' => $request->beneficiaries,
            'progress' => $request->progress,
            'category' => $request->category,
            'user_id' => Auth::id(),
        ];

        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('projects', 'public');
            $data['image'] = $imagePath;
        }

        $project = Project::create($data);

        // If project is created as completed, create accomplishment
        if ($request->status === 'completed') {
            $this->createAccomplishmentFromProject($project);
        }

        return response()->json($project->load('user'), 201);
    }

    public function show($id)
    {
        $project = Project::with('user')->findOrFail($id);
        return response()->json($project);
    }

    public function update(Request $request, $id)
    {
        $project = Project::findOrFail($id);
        $oldStatus = $project->status;

        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'full_description' => 'nullable|string',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'status' => 'required|in:planning,ongoing,completed,cancelled',
            'location' => 'required|string|max:255',
            'beneficiaries' => 'required|integer|min:0',
            'progress' => 'required|integer|min:0|max:100',
            'category' => 'required|in:Infrastructure,Education,Environment,Sports,Health,Social Services',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        $data = [
            'title' => $request->title,
            'description' => $request->description,
            'full_description' => $request->full_description,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'status' => $request->status,
            'location' => $request->location,
            'beneficiaries' => $request->beneficiaries,
            'progress' => $request->progress,
            'category' => $request->category,
        ];

        if ($request->hasFile('image')) {
            if ($project->image) {
                Storage::disk('public')->delete($project->image);
            }
            $imagePath = $request->file('image')->store('projects', 'public');
            $data['image'] = $imagePath;
        }

        $project->update($data);

        // Handle status change to completed
        if ($oldStatus !== 'completed' && $request->status === 'completed') {
            $this->createAccomplishmentFromProject($project);
        }
        // Handle status change from completed to something else
        elseif ($oldStatus === 'completed' && $request->status !== 'completed') {
            $this->deleteAccomplishmentFromProject($project->id);
        }

        return response()->json($project->load('user'));
    }

    public function destroy($id)
    {
        $project = Project::findOrFail($id);
        
        // Delete associated accomplishment if project was completed
        if ($project->status === 'completed') {
            $this->deleteAccomplishmentFromProject($project->id);
        }
        
        if ($project->image) {
            Storage::disk('public')->delete($project->image);
        }
        
        $project->delete();

        return response()->json(['message' => 'Project deleted successfully']);
    }

    /**
     * Create an accomplishment from a completed project
     */
    private function createAccomplishmentFromProject($project)
    {
        try {
            // Check if accomplishment already exists for this project
            $existingAccomplishment = Accomplishment::where('project_id', $project->id)->first();
            
            if ($existingAccomplishment) {
                // Update existing accomplishment
                $existingAccomplishment->update([
                    'title' => $project->title,
                    'description' => $project->full_description ?? $project->description,
                    'location' => $project->location,
                    'date_completed' => $project->end_date,
                ]);
                
                // Update image if project has one and accomplishment doesn't have its own photo
                if ($project->image && !$existingAccomplishment->photo) {
                    $this->copyProjectImageToAccomplishment($project, $existingAccomplishment);
                }
                
                Log::info('Updated accomplishment from project', ['project_id' => $project->id]);
            } else {
                // Create new accomplishment
                $accomplishment = Accomplishment::create([
                    'title' => $project->title,
                    'description' => $project->full_description ?? $project->description,
                    'location' => $project->location,
                    'date_completed' => $project->end_date,
                    'project_id' => $project->id,
                ]);

                // Copy project image if exists
                if ($project->image) {
                    $this->copyProjectImageToAccomplishment($project, $accomplishment);
                }
                
                Log::info('Created accomplishment from project', ['project_id' => $project->id]);
            }
            
        } catch (\Exception $e) {
            Log::error('Failed to create accomplishment from project: ' . $e->getMessage(), [
                'project_id' => $project->id,
                'trace' => $e->getTraceAsString()
            ]);
        }
    }

    /**
     * Delete accomplishment associated with a project
     */
    private function deleteAccomplishmentFromProject($projectId)
    {
        try {
            $accomplishment = Accomplishment::where('project_id', $projectId)->first();
            
            if ($accomplishment) {
                // Delete photo if exists
                if ($accomplishment->photo) {
                    Storage::disk('public')->delete($accomplishment->photo);
                }
                
                $accomplishment->delete();
                Log::info('Deleted accomplishment from project', ['project_id' => $projectId]);
            }
        } catch (\Exception $e) {
            Log::error('Failed to delete accomplishment from project: ' . $e->getMessage(), [
                'project_id' => $projectId,
                'trace' => $e->getTraceAsString()
            ]);
        }
    }

    /**
     * Copy project image to accomplishment
     */
    private function copyProjectImageToAccomplishment($project, $accomplishment)
    {
        try {
            if (Storage::disk('public')->exists($project->image)) {
                $extension = pathinfo($project->image, PATHINFO_EXTENSION);
                $newFilename = 'accomplishments/' . uniqid() . '.' . $extension;
                
                // Copy the file
                Storage::disk('public')->copy($project->image, $newFilename);
                
                // Update accomplishment with new photo path
                $accomplishment->update(['photo' => $newFilename]);
                
                Log::info('Copied project image to accomplishment', [
                    'project_id' => $project->id,
                    'accomplishment_id' => $accomplishment->id,
                    'new_path' => $newFilename
                ]);
            }
        } catch (\Exception $e) {
            Log::error('Failed to copy project image: ' . $e->getMessage(), [
                'project_id' => $project->id,
                'accomplishment_id' => $accomplishment->id
            ]);
        }
    }
}