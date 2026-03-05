<?php
namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Achievement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class AchievementController extends Controller
{
    public function index()
    {
        try {
            // Simple query to test
            $achievements = Achievement::all();
            
            return response()->json($achievements);
            
        } catch (\Exception $e) {
            Log::error('Achievement index error: ' . $e->getMessage());
            
            return response()->json([
                'error' => 'Failed to fetch achievements',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'year' => 'required|string|max:4',
                'title' => 'required|string|max:255',
                'description' => 'required|string',
            ]);

            $achievement = Achievement::create($validated);
            
            return response()->json($achievement, 201);
            
        } catch (\Exception $e) {
            Log::error('Achievement store error: ' . $e->getMessage());
            
            return response()->json([
                'error' => 'Failed to create achievement',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $achievement = Achievement::findOrFail($id);

            $validated = $request->validate([
                'year' => 'required|string|max:4',
                'title' => 'required|string|max:255',
                'description' => 'required|string',
            ]);

            $achievement->update($validated);
            
            return response()->json($achievement);
            
        } catch (\Exception $e) {
            Log::error('Achievement update error: ' . $e->getMessage());
            
            return response()->json([
                'error' => 'Failed to update achievement',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $achievement = Achievement::findOrFail($id);
            $achievement->delete();
            
            return response()->json(['message' => 'Achievement deleted successfully']);
            
        } catch (\Exception $e) {
            Log::error('Achievement delete error: ' . $e->getMessage());
            
            return response()->json([
                'error' => 'Failed to delete achievement',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}