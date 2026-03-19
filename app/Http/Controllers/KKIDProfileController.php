<?php

namespace App\Http\Controllers;

use App\Models\KKIDProfile;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class KKIDProfileController extends Controller
{
    /**
     * Get all KKID profiles
     */
    public function index(Request $request)
    {
        Log::info('=== KKID Profile index START ===', [
            'user_id' => auth()->id(),
            'request' => $request->all()
        ]);
        
        try {
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
            
            // Get all profiles (no pagination for now to simplify)
            $profiles = $query->orderBy('created_at', 'desc')->get();
            
            Log::info('Profiles fetched:', ['count' => $profiles->count()]);
            
            // Return proper JSON response
            return response()->json([
                'success' => true,
                'data' => $profiles,
                'statistics' => $this->getStatistics()
            ], 200, [], JSON_PRETTY_PRINT);
            
        } catch (\Exception $e) {
            Log::error('KKID Profile index error: ' . $e->getMessage() . "\n" . $e->getTraceAsString());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch profiles',
                'error' => env('APP_DEBUG') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Get single KKID profile
     */
    public function show($id)
    {
        try {
            $profile = KKIDProfile::find($id);
            
            if (!$profile) {
                return response()->json([
                    'success' => false,
                    'message' => 'Profile not found'
                ], 404);
            }
            
            return response()->json([
                'success' => true,
                'data' => $profile
            ]);
            
        } catch (\Exception $e) {
            Log::error('KKID Profile show error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error fetching profile'
            ], 500);
        }
    }

    /**
     * Create new KKID profile
     */
    public function store(Request $request)
    {
        Log::info('KKID Profile store called', ['request_keys' => array_keys($request->all())]);
        
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
                'is_voter' => 'nullable|boolean',
                'precinct_number' => 'nullable|string|max:50',
                'status' => 'required|in:pending,approved,rejected',
                'photo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:5120'
            ]);

            if ($validator->fails()) {
                Log::error('Validation failed', $validator->errors()->toArray());
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

            // Handle photo upload
            if ($request->hasFile('photo')) {
                Log::info('Photo file received', ['filename' => $request->file('photo')->getClientOriginalName()]);
                $photo = $request->file('photo');
                $photoName = time() . '_' . $photo->getClientOriginalName();
                $photoPath = $photo->storeAs('kkid_photos', $photoName, 'public');
                $validated['photo_url'] = Storage::url($photoPath);
                Log::info('Photo saved', ['path' => $photoPath, 'url' => $validated['photo_url']]);
            }

            // Convert boolean values
            $validated['is_voter'] = isset($validated['is_voter']) ? (bool)$validated['is_voter'] : false;

            Log::info('Creating profile with data:', array_keys($validated));
            $profile = KKIDProfile::create($validated);

            return response()->json([
                'success' => true,
                'message' => 'KKID profile created successfully',
                'data' => $profile
            ], 201);

        } catch (\Exception $e) {
            Log::error('KKID Profile store error: ' . $e->getMessage() . "\n" . $e->getTraceAsString());
            return response()->json([
                'success' => false,
                'message' => 'Failed to create profile: ' . (env('APP_DEBUG') ? $e->getMessage() : 'Internal server error')
            ], 500);
        }
    }

    /**
     * Update KKID profile
     */
    public function update(Request $request, $id)
    {
        Log::info('KKID Profile update called', ['id' => $id, 'request_keys' => array_keys($request->all())]);
        
        try {
            $profile = KKIDProfile::find($id);
            
            if (!$profile) {
                return response()->json([
                    'success' => false,
                    'message' => 'Profile not found'
                ], 404);
            }
            
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
                'is_voter' => 'nullable|boolean',
                'precinct_number' => 'nullable|string|max:50',
                'status' => 'in:pending,approved,rejected',
                'photo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:5120'
            ]);

            if ($validator->fails()) {
                Log::error('Validation failed on update', $validator->errors()->toArray());
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $validated = $validator->validated();
            
            // Convert is_voter to boolean
            if (isset($validated['is_voter'])) {
                $validated['is_voter'] = (bool)$validated['is_voter'];
            }
            
            // If status is being updated to approved and hasn't been approved before
            if (isset($validated['status']) && 
                $validated['status'] === 'approved' && 
                !$profile->approved_date) {
                $validated['approved_date'] = now()->toDateString();
            }

            // Handle photo upload for updates
            if ($request->hasFile('photo')) {
                Log::info('Updating photo for profile', ['id' => $id]);
                // Delete old photo if exists
                if ($profile->photo_url) {
                    $oldPhotoPath = str_replace('/storage/', '', $profile->photo_url);
                    Storage::disk('public')->delete($oldPhotoPath);
                }
                
                $photo = $request->file('photo');
                $photoName = time() . '_' . $photo->getClientOriginalName();
                $photoPath = $photo->storeAs('kkid_photos', $photoName, 'public');
                $validated['photo_url'] = Storage::url($photoPath);
            }

            Log::info('Updating profile with data:', array_keys($validated));
            $profile->update($validated);

            return response()->json([
                'success' => true,
                'message' => 'KKID profile updated successfully',
                'data' => $profile
            ]);

        } catch (\Exception $e) {
            Log::error('KKID Profile update error: ' . $e->getMessage() . "\n" . $e->getTraceAsString());
            return response()->json([
                'success' => false,
                'message' => 'Failed to update profile: ' . (env('APP_DEBUG') ? $e->getMessage() : 'Internal server error')
            ], 500);
        }
    }

    /**
     * Delete KKID profile
     */
    public function destroy($id)
    {
        try {
            $profile = KKIDProfile::find($id);
            
            if (!$profile) {
                return response()->json([
                    'success' => false,
                    'message' => 'Profile not found'
                ], 404);
            }
            
            // Delete photo if exists
            if ($profile->photo_url) {
                $oldPhotoPath = str_replace('/storage/', '', $profile->photo_url);
                Storage::disk('public')->delete($oldPhotoPath);
            }
            
            $profile->delete();

            return response()->json([
                'success' => true,
                'message' => 'KKID profile deleted successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('KKID Profile destroy error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete profile'
            ], 500);
        }
    }

    /**
     * Update profile status
     */
    public function updateStatus(Request $request, $id)
    {
        try {
            $profile = KKIDProfile::find($id);
            
            if (!$profile) {
                return response()->json([
                    'success' => false,
                    'message' => 'Profile not found'
                ], 404);
            }
            
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
            Log::error('KKID Profile updateStatus error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to update status'
            ], 500);
        }
    }

    public function export(Request $request): JsonResponse
{
    try {
        $query = KKIDProfile::query();
        
        // Apply date filter
        if ($request->has('date_filter') && $request->date_filter !== 'all') {
            $now = now();
            
            switch ($request->date_filter) {
                case 'today':
                    $query->whereDate('created_at', $now->toDateString());
                    break;
                case '7days':
                    $query->whereDate('created_at', '>=', $now->subDays(7)->toDateString());
                    break;
                case '30days':
                    $query->whereDate('created_at', '>=', $now->subDays(30)->toDateString());
                    break;
                case 'year':
                    $query->whereYear('created_at', $now->year);
                    break;
                }
            }
            
            // Apply status filter if provided
            if ($request->has('status') && $request->status !== 'all') {
                $query->where('status', $request->status);
            }
            
            // Apply search filter if provided
            if ($request->has('search') && !empty($request->search)) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('full_name', 'like', "%{$search}%")
                      ->orWhere('kkid_number', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%")
                      ->orWhere('contact_number', 'like', "%{$search}%");
                });
            }
            
            $profiles = $query->orderBy('created_at', 'desc')->get();
            
            // Create temp file
            $tempFile = tempnam(sys_get_temp_dir(), 'export_') . '.csv';
            $handle = fopen($tempFile, 'w');
            
            // Add UTF-8 BOM for Excel compatibility
            fprintf($handle, chr(0xEF).chr(0xBB).chr(0xBF));
            
            // Add filter information header
            $filterInfo = match($request->date_filter) {
                'today' => 'Today\'s Records',
                '7days' => 'Last 7 Days Records',
                '30days' => 'Last 30 Days Records',
                'year' => 'This Year\'s Records',
                default => 'All Time Records'
            };
            
            if ($request->has('status') && $request->status !== 'all') {
                $filterInfo .= ' - Status: ' . ucfirst($request->status);
            }
            
            fputcsv($handle, ['KKID PROFILES EXPORT REPORT']);
            fputcsv($handle, ['Generated: ' . now()->format('F d, Y h:i A')]);
            fputcsv($handle, ['Filter: ' . $filterInfo]);
            fputcsv($handle, ['Total Records: ' . $profiles->count()]);
            fputcsv($handle, []); // Empty row for spacing
            
            // Add headers
            fputcsv($handle, [
                'ID',
                'KKID Number',
                'Full Name',
                'Birthday',
                'Age',
                'Gender',
                'Civil Status',
                'Contact Number',
                'Email',
                'Address',
                'Youth Organization',
                'Facebook Account',
                'Registered Voter',
                'Precinct Number',
                'Status',
                'Created Date'
            ]);
            
            // Add data rows
            foreach ($profiles as $profile) {
                // Calculate age properly - FIXED
                $age = 'N/A';
                if ($profile->birthday) {
                    $birthDate = \Carbon\Carbon::parse($profile->birthday);
                    $today = \Carbon\Carbon::now();
                    
                    // Calculate age ensuring it's not negative
                    if ($birthDate->lte($today)) { // Check if birth date is not in the future
                        $age = $birthDate->diffInYears($today);
                        // Ensure age is a positive integer
                        $age = max(0, (int)$age);
                    } else {
                        $age = 0; // Birth date in future, set to 0
                    }
                }
                
                fputcsv($handle, [
                    $profile->id,
                    $profile->kkid_number ?? 'N/A',
                    $profile->full_name ?? 'N/A',
                    $profile->birthday ? date('M d, Y', strtotime($profile->birthday)) : 'N/A',
                    $age, // Now properly formatted as integer
                    $profile->gender ?? 'N/A',
                    $profile->civil_status ?? 'N/A',
                    $profile->contact_number ?? 'N/A',
                    $profile->email ?? 'N/A',
                    $profile->address ?? 'N/A',
                    $profile->youth_organization ?? 'N/A',
                    $profile->facebook_account ?? 'N/A',
                    $profile->is_voter ? 'Yes' : 'No',
                    $profile->precinct_number ?? 'N/A',
                    ucfirst($profile->status ?? 'pending'),
                    $profile->created_at ? date('M d, Y', strtotime($profile->created_at)) : 'N/A'
                ]);
            }
            
            fclose($handle);
            
            // Read file content
            $fileContent = file_get_contents($tempFile);
            
            // Delete temp file
            unlink($tempFile);
            
            // Generate filename
            $filterName = match($request->date_filter) {
                'today' => 'today',
                '7days' => 'last_7_days',
                '30days' => 'last_30_days',
                'year' => 'this_year',
                default => 'all_time'
            };
            
            $filename = "kkid_profiles_{$filterName}_" . date('Y-m-d_His') . '.csv';
            
            return response()->json([
                'success' => true,
                'data' => [
                    'filename' => $filename,
                    'content' => base64_encode($fileContent),
                    'count' => $profiles->count(),
                    'filter' => $filterInfo
                ]
            ]);
            
        } catch (\Exception $e) {
            Log::error('Export failed: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to export data: ' . $e->getMessage()
            ], 500);
        }
    }

    public function generateID($id)
    {
        try {
            $profile = KKIDProfile::find($id);
            
            if (!$profile) {
                return response()->json([
                    'success' => false,
                    'message' => 'Profile not found'
                ], 404);
            }
            
            return response()->json([
                'success' => true,
                'data' => [
                    'profile' => $profile,
                    'id_card_data' => [
                        'full_name' => $profile->full_name,
                        'kkid_number' => $profile->kkid_number,
                        'validity_date' => $profile->validity_date,
                        'youth_organization' => $profile->youth_organization,
                        'email' => $profile->email,
                        'facebook_account' => $profile->facebook_account,
                        'contact_number' => $profile->contact_number,
                        'is_voter' => $profile->is_voter,
                        'precinct_number' => $profile->precinct_number,
                        'status' => $profile->status
                    ]
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('KKID Profile generateID error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate ID'
            ], 500);
        }
    }   

    private function generateQRCode($kkidNumber)
    {
        return null; // Temporarily return null
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
            Log::error('KKID Profile statistics error: ' . $e->getMessage());
            return [
                'total' => 0,
                'approved' => 0,
                'pending' => 0,
                'rejected' => 0
            ];
        }
    }
}