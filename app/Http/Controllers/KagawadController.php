<?php
// app/Http/Controllers/KagawadController.php

namespace App\Http\Controllers;

use App\Models\Kagawad;
use App\Models\KagawadActivity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class KagawadController extends Controller
{
    /**
     * Get all kagawads (for admin selection)
     */
    public function index()
    {
        try {
            $kagawads = Kagawad::with('activities')->get();
            return response()->json([
                'success' => true,
                'data' => $kagawads
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching kagawads: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch kagawads'
            ], 500);
        }
    }

    /**
     * Get featured kagawad of the day (for public view)
     */
    public function getFeatured()
    {
        try {
            $featured = Kagawad::with('activities')
                ->where('is_featured', true)
                ->first();

            if (!$featured) {
                // If no featured kagawad, get the first one as default
                $featured = Kagawad::with('activities')->first();
                
                if ($featured) {
                    $featured->is_featured = true;
                    $featured->save();
                }
            }

            return response()->json([
                'success' => true,
                'data' => $featured
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching featured kagawad: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch featured kagawad'
            ], 500);
        }
    }

    /**
     * Store a new kagawad
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'position' => 'required|string|max:255',
                'bio' => 'nullable|string',
                'contact' => 'nullable|string',
                'email' => 'nullable|email',
                'address' => 'nullable|string',
                'date_started' => 'nullable|string',
                'photo' => 'nullable|string', // Base64 image
            ]);

            // Handle photo upload
            if ($request->has('photo') && $request->photo) {
                $validated['photo'] = $this->uploadPhoto($request->photo);
            }

            $kagawad = Kagawad::create($validated);

            return response()->json([
                'success' => true,
                'message' => 'Kagawad created successfully',
                'data' => $kagawad
            ], 201);
        } catch (\Exception $e) {
            Log::error('Error creating kagawad: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to create kagawad'
            ], 500);
        }
    }

    /**
     * Update a kagawad
     */
    public function update(Request $request, $id)
    {
        try {
            $kagawad = Kagawad::findOrFail($id);

            $validated = $request->validate([
                'name' => 'sometimes|string|max:255',
                'position' => 'sometimes|string|max:255',
                'bio' => 'nullable|string',
                'contact' => 'nullable|string',
                'email' => 'nullable|email',
                'address' => 'nullable|string',
                'date_started' => 'nullable|string',
                'photo' => 'nullable|string',
            ]);

            // Handle photo upload
            if ($request->has('photo') && $request->photo && str_starts_with($request->photo, 'data:image')) {
                // Delete old photo if exists
                if ($kagawad->photo) {
                    $oldPath = str_replace('/storage/', '', $kagawad->photo);
                    Storage::disk('public')->delete($oldPath);
                }
                
                $validated['photo'] = $this->uploadPhoto($request->photo);
            }

            $kagawad->update($validated);

            return response()->json([
                'success' => true,
                'message' => 'Kagawad updated successfully',
                'data' => $kagawad
            ]);
        } catch (\Exception $e) {
            Log::error('Error updating kagawad: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to update kagawad'
            ], 500);
        }
    }

    /**
     * Set featured kagawad
     */
    public function setFeatured($id)
    {
        try {
            // Remove featured status from all kagawads
            Kagawad::where('is_featured', true)->update(['is_featured' => false]);

            // Set new featured kagawad
            $kagawad = Kagawad::findOrFail($id);
            $kagawad->is_featured = true;
            $kagawad->save();

            return response()->json([
                'success' => true,
                'message' => 'Featured kagawad updated successfully',
                'data' => $kagawad->load('activities')
            ]);
        } catch (\Exception $e) {
            Log::error('Error setting featured kagawad: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to set featured kagawad'
            ], 500);
        }
    }

    /**
     * Add activity to kagawad
     */
    public function addActivity(Request $request, $kagawadId)
    {
        try {
            $validated = $request->validate([
                'title' => 'required|string|max:255',
                'date' => 'required|date',
                'description' => 'required|string'
            ]);

            $activity = KagawadActivity::create([
                'kagawad_id' => $kagawadId,
                ...$validated
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Activity added successfully',
                'data' => $activity
            ], 201);
        } catch (\Exception $e) {
            Log::error('Error adding activity: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to add activity'
            ], 500);
        }
    }

    /**
     * Delete activity
     */
    public function deleteActivity($id)
    {
        try {
            $activity = KagawadActivity::findOrFail($id);
            $activity->delete();

            return response()->json([
                'success' => true,
                'message' => 'Activity deleted successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Error deleting activity: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete activity'
            ], 500);
        }
    }

    /**
     * Delete kagawad
     */
    public function destroy($id)
    {
        try {
            $kagawad = Kagawad::findOrFail($id);
            
            // Delete photo if exists
            if ($kagawad->photo) {
                $path = str_replace('/storage/', '', $kagawad->photo);
                Storage::disk('public')->delete($path);
            }

            $kagawad->delete();

            return response()->json([
                'success' => true,
                'message' => 'Kagawad deleted successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Error deleting kagawad: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete kagawad'
            ], 500);
        }
    }

    /**
     * Upload photo
     */
    private function uploadPhoto($base64Image)
    {
        try {
            // Extract image data
            if (preg_match('/^data:image\/(\w+);base64,/', $base64Image, $matches)) {
                $imageType = $matches[1];
                $imageData = substr($base64Image, strpos($base64Image, ',') + 1);
                $imageData = base64_decode($imageData);

                $filename = 'kagawad/' . uniqid() . '.' . $imageType;
                Storage::disk('public')->put($filename, $imageData);

                return '/storage/' . $filename;
            }

            return null;
        } catch (\Exception $e) {
            Log::error('Error uploading photo: ' . $e->getMessage());
            return null;
        }
    }
}