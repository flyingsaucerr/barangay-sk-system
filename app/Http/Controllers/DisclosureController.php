<?php

namespace App\Http\Controllers;

use App\Models\Disclosure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class DisclosureController extends Controller
{
    public function index()
    {
        try {
            Log::info('Fetching disclosures from database');
            
            // Check if table exists
            if (!\Schema::hasTable('disclosures')) {
                Log::error('Disclosures table does not exist');
                return response()->json([
                    'error' => 'Table not found',
                    'message' => 'Disclosures table does not exist. Please run migrations.'
                ], 500);
            }

            $disclosures = Disclosure::orderBy('created_at', 'desc')->get();
            Log::info('Found ' . $disclosures->count() . ' disclosures');
            
            return response()->json($disclosures);

        } catch (\Exception $e) {
            Log::error('Error fetching disclosures: ' . $e->getMessage());
            return response()->json([
                'error' => 'Server error',
                'message' => $e->getMessage(),
                'trace' => config('app.debug') ? $e->getTrace() : 'Hidden in production'
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $disclosure = Disclosure::findOrFail($id);
            return response()->json($disclosure);
        } catch (\Exception $e) {
            Log::error('Error fetching disclosure: ' . $e->getMessage());
            return response()->json([
                'error' => 'Disclosure not found',
                'message' => $e->getMessage()
            ], 404);
        }
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'title' => 'required|string|max:255',
                'description' => 'required|string',
                'date' => 'required|string|max:255',
                'category' => 'required|string|max:255',
                'full_details' => 'required|string',
                'is_published' => 'boolean'
            ]);

            $disclosure = Disclosure::create($validated);
            return response()->json($disclosure, 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'error' => 'Validation failed',
                'messages' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Error creating disclosure: ' . $e->getMessage());
            return response()->json([
                'error' => 'Failed to create disclosure',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $disclosure = Disclosure::findOrFail($id);

            $validated = $request->validate([
                'title' => 'required|string|max:255',
                'description' => 'required|string',
                'date' => 'required|string|max:255',
                'category' => 'required|string|max:255',
                'full_details' => 'required|string',
                'is_published' => 'boolean'
            ]);

            $disclosure->update($validated);
            return response()->json($disclosure);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'error' => 'Validation failed',
                'messages' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Error updating disclosure: ' . $e->getMessage());
            return response()->json([
                'error' => 'Failed to update disclosure',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $disclosure = Disclosure::findOrFail($id);
            $disclosure->delete();
            return response()->json(null, 204);

        } catch (\Exception $e) {
            Log::error('Error deleting disclosure: ' . $e->getMessage());
            return response()->json([
                'error' => 'Failed to delete disclosure',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}