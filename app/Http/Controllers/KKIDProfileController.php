<?php

namespace App\Http\Controllers;

use App\Models\KKIDProfile;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Validator;

class KKIDProfileController extends Controller
{
    /**
     * Get all KKID profiles
     */
    public function index(Request $request)
    {
        try {
            \Log::info('KKID Profile index called', [
                'user_id' => auth()->id(),
                'search' => $request->search,
                'status' => $request->status
            ]);
            
            $query = KKIDProfile::query();
            
            // Search functionality
            if ($request->has('search') && $request->search) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('full_name', 'like', "%{$search}%")
                      ->orWhere('kkid_number', 'like', "%{$search}%")
                      ->orWhere('contact_number', 'like', "%{$search}%");
                });
            }
            
            // Status filter
            if ($request->has('status') && $request->status !== 'all') {
                $query->where('status', $request->status);
            }
            
            $profiles = $query->orderBy('created_at', 'desc')->paginate(20);
            
            return response()->json([
                'success' => true,
                'data' => $profiles,
                'statistics' => $this->getStatistics()
            ]);
            
        } catch (\Exception $e) {
            \Log::error('KKID Profile index error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch profiles',
                'error' => $e->getMessage(),
                'trace' => env('APP_DEBUG') ? $e->getTraceAsString() : null
            ], 500);
        }
    }

    /**
     * Get single KKID profile
     */
    public function show($id)
    {
        try {
            $profile = KKIDProfile::findOrFail($id);
            
            return response()->json([
                'success' => true,
                'data' => $profile
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Profile not found'
            ], 404);
        }
    }

    /**
     * Create new KKID profile
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'full_name' => 'required|string|max:255',
                'address' => 'required|string',
                'birthday' => 'required|date',
                'gender' => 'required|in:Male,Female,Other',
                'emergency_contact_name' => 'required|string|max:255',
                'emergency_contact_address' => 'required|string',
                'emergency_contact_birthday' => 'required|date',
                'emergency_contact_number' => 'required|string|max:20',
                'emergency_contact_relationship' => 'required|string|max:100',
                'civil_status' => 'required|in:Single,Married,Widowed,Separated',
                'kkid_number' => 'required|string|max:50|unique:kkid_profiles',
                'validity_date' => 'required|date',
                'youth_organization' => 'nullable|string|max:255',
                'email' => 'nullable|email|max:255',
                'facebook_account' => 'nullable|string|max:255',
                'contact_number' => 'required|string|max:20',
                'is_voter' => 'boolean',
                'precinct_number' => 'nullable|string|max:50',
                'status' => 'in:pending,approved,rejected'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $validated = $validator->validated();
            $validated['application_date'] = now()->toDateString();
            
            if ($validated['status'] === 'approved' && empty($validated['approved_date'])) {
                $validated['approved_date'] = now()->toDateString();
            }

            $profile = KKIDProfile::create($validated);

            return response()->json([
                'success' => true,
                'message' => 'KKID profile created successfully',
                'data' => $profile
            ], 201);

        } catch (\Exception $e) {
            \Log::error('KKID Profile store error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to create profile',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update KKID profile
     */
    public function update(Request $request, $id)
    {
        try {
            $profile = KKIDProfile::findOrFail($id);
            
            $validator = Validator::make($request->all(), [
                'full_name' => 'string|max:255',
                'address' => 'string',
                'birthday' => 'date',
                'gender' => 'in:Male,Female,Other',
                'emergency_contact_name' => 'string|max:255',
                'emergency_contact_address' => 'string',
                'emergency_contact_birthday' => 'date',
                'emergency_contact_number' => 'string|max:20',
                'emergency_contact_relationship' => 'string|max:100',
                'civil_status' => 'in:Single,Married,Widowed,Separated',
                'kkid_number' => 'string|max:50|unique:kkid_profiles,kkid_number,' . $id,
                'validity_date' => 'date',
                'youth_organization' => 'nullable|string|max:255',
                'email' => 'nullable|email|max:255',
                'facebook_account' => 'nullable|string|max:255',
                'contact_number' => 'string|max:20',
                'is_voter' => 'boolean',
                'precinct_number' => 'nullable|string|max:50',
                'status' => 'in:pending,approved,rejected'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $validated = $validator->validated();
            
            // If status is being updated to approved and hasn't been approved before
            if (isset($validated['status']) && 
                $validated['status'] === 'approved' && 
                !$profile->approved_date) {
                $validated['approved_date'] = now()->toDateString();
            }

            $profile->update($validated);

            return response()->json([
                'success' => true,
                'message' => 'KKID profile updated successfully',
                'data' => $profile
            ]);

        } catch (\Exception $e) {
            \Log::error('KKID Profile update error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to update profile',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete KKID profile
     */
    public function destroy($id)
    {
        try {
            $profile = KKIDProfile::findOrFail($id);
            $profile->delete();

            return response()->json([
                'success' => true,
                'message' => 'KKID profile deleted successfully'
            ]);

        } catch (\Exception $e) {
            \Log::error('KKID Profile destroy error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete profile',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update profile status
     */
    public function updateStatus(Request $request, $id)
    {
        try {
            $profile = KKIDProfile::findOrFail($id);
            
            $request->validate([
                'status' => 'required|in:pending,approved,rejected'
            ]);

            $status = $request->status;
            $updateData = ['status' => $status];
            
            if ($status === 'approved' && !$profile->approved_date) {
                $updateData['approved_date'] = now()->toDateString();
            }

            $profile->update($updateData);

            return response()->json([
                'success' => true,
                'message' => 'Profile status updated successfully',
                'data' => $profile
            ]);

        } catch (\Exception $e) {
            \Log::error('KKID Profile updateStatus error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to update status',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get statistics
     */
    private function getStatistics()
    {
        try {
            return [
                'total' => KKIDProfile::count(),
                'approved' => KKIDProfile::where('status', 'approved')->count(),
                'pending' => KKIDProfile::where('status', 'pending')->count(),
                'rejected' => KKIDProfile::where('status', 'rejected')->count()
            ];
        } catch (\Exception $e) {
            \Log::error('KKID Profile statistics error: ' . $e->getMessage());
            return [
                'total' => 0,
                'approved' => 0,
                'pending' => 0,
                'rejected' => 0
            ];
        }
    }
}