<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

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
        ]);

        $project = Project::create([
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
        ]);

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
        ]);

        $project->update([
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
        ]);

        return response()->json($project->load('user'));
    }

    public function destroy($id)
    {
        $project = Project::findOrFail($id);
        $project->delete();

        return response()->json(['message' => 'Project deleted successfully']);
    }
}