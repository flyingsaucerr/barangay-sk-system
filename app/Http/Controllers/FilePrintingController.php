<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\FilePrintingRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;

class FilePrintingController extends Controller
{
    /**
     * Get all printing requests (admin)
     */
    public function index(Request $request)
    {
        try {
            Log::info('Admin index method called', ['query' => $request->all()]);
            
            $query = FilePrintingRequest::query();
            
            // Search functionality
            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('tracking_number', 'like', "%{$search}%")
                      ->orWhere('requester_name', 'like', "%{$search}%")
                      ->orWhere('contact_number', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                });
            }
            
            // Status filter
            if ($request->has('status') && $request->status !== 'all') {
                $query->where('status', $request->status);
            }
            
            // Date filter
            if ($request->has('date_from')) {
                $query->whereDate('submitted_at', '>=', $request->date_from);
            }
            if ($request->has('date_to')) {
                $query->whereDate('submitted_at', '<=', $request->date_to);
            }
            
            $requests = $query->orderBy('submitted_at', 'desc')->get(); // Changed from paginate() to get()
            
            // Debug logging
            Log::info('Admin index returning data:', [
                'total_requests' => $requests->count(),
                'sample_request' => $requests->first() ? [
                    'id' => $requests->first()->id,
                    'tracking' => $requests->first()->tracking_number,
                    'has_files' => !empty($requests->first()->files),
                    'files_type' => gettype($requests->first()->files),
                    'files_value' => $requests->first()->files,
                    'files_json' => json_encode($requests->first()->files)
                ] : 'no_requests'
            ]);
            
            return response()->json([
                'success' => true,
                'data' => $requests, // Return as array, not paginated object
                'statistics' => $this->getStatistics()
            ]);
            
        } catch (\Exception $e) {
            Log::error('Admin index error:', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch printing requests',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create new printing request with files (public) - SINGLE ENDPOINT
     */
    public function store(Request $request)
    {
        try {
            Log::info('Store method called', [
                'has_files' => $request->hasFile('files'),
                'files_count' => $request->hasFile('files') ? count($request->file('files')) : 0,
                'request_data' => $request->except('files')
            ]);
            
            // Check if request has files (FormData) or is JSON
            if ($request->hasFile('files')) {
                // Handle FormData with files
                $validator = Validator::make($request->all(), [
                    'requester_name' => 'required|string|max:255',
                    'contact_number' => 'required|string|max:20',
                    'email' => 'nullable|email|max:255',
                    'notes' => 'nullable|string',
                    'copies' => 'required|integer|min:1|max:10',
                    'files' => 'required|array|min:1|max:10',
                    'files.*' => 'required|file|max:10240' // 10MB max
                ]);
                
                if ($validator->fails()) {
                    Log::warning('FormData validation failed:', ['errors' => $validator->errors()]);
                    return response()->json([
                        'success' => false,
                        'message' => 'Validation failed',
                        'errors' => $validator->errors()
                    ], 422);
                }
                
                // Upload files
                $uploadedFiles = [];
                foreach ($request->file('files') as $file) {
                    $originalName = $file->getClientOriginalName();
                    $filename = Str::random(20) . '_' . time() . '.' . $file->getClientOriginalExtension();
                    $path = $file->storeAs('printing-requests', $filename, 'public');
                    
                    // Verify the file was stored
                    if (!Storage::disk('public')->exists($path)) {
                        throw new \Exception("File storage failed: {$path}");
                    }
                    
                    // Get actual stored file info
                    $storedSize = Storage::disk('public')->size($path);
                    $storedMime = Storage::disk('public')->mimeType($path);
                    
                    Log::info('File storage verification:', [
                        'original_size' => $file->getSize(),
                        'stored_size' => $storedSize,
                        'stored_mime' => $storedMime,
                        'path' => $path
                    ]);
                    
                    if ($storedSize === 0) {
                        throw new \Exception("File stored as 0 bytes: {$originalName}");
                    }
                    
                    $uploadedFiles[] = [
                        'original_name' => $originalName,
                        'filename' => $filename,
                        'path' => $path,
                        'size' => $storedSize, // Use actual stored size
                        'mime_type' => $storedMime, // Use actual mime type
                        'uploaded_at' => now()->toDateTimeString()
                    ];
                }
                
                // Create request WITH files
                $printingRequest = FilePrintingRequest::create([
                    'tracking_number' => FilePrintingRequest::generateTrackingNumber(),
                    'requester_name' => $request->requester_name,
                    'contact_number' => $request->contact_number,
                    'email' => $request->email,
                    'notes' => $request->notes,
                    'copies' => $request->copies,
                    'status' => 'pending',
                    'submitted_at' => now(),
                    'files' => $uploadedFiles // Store files as JSON
                ]);
                
                Log::info('Request created with files:', [
                    'id' => $printingRequest->id,
                    'tracking' => $printingRequest->tracking_number,
                    'files_count' => count($uploadedFiles)
                ]);
                
            } else {
                // Handle JSON request without files
                $validator = Validator::make($request->all(), [
                    'requester_name' => 'required|string|max:255',
                    'contact_number' => 'required|string|max:20',
                    'email' => 'nullable|email|max:255',
                    'notes' => 'nullable|string',
                    'copies' => 'required|integer|min:1|max:10',
                ]);
                
                if ($validator->fails()) {
                    Log::warning('JSON validation failed:', ['errors' => $validator->errors()]);
                    return response()->json([
                        'success' => false,
                        'message' => 'Validation failed',
                        'errors' => $validator->errors()
                    ], 422);
                }
                
                // Create request WITHOUT files
                $printingRequest = FilePrintingRequest::create([
                    'tracking_number' => FilePrintingRequest::generateTrackingNumber(),
                    'requester_name' => $request->requester_name,
                    'contact_number' => $request->contact_number,
                    'email' => $request->email,
                    'notes' => $request->notes,
                    'copies' => $request->copies,
                    'status' => 'pending',
                    'submitted_at' => now(),
                    'files' => [] // Empty array
                ]);
                
                Log::info('Request created without files:', [
                    'id' => $printingRequest->id,
                    'tracking' => $printingRequest->tracking_number
                ]);
            }
            
            // Verify the created record
            $createdRecord = FilePrintingRequest::find($printingRequest->id);
            Log::info('Record verified:', [
                'id' => $createdRecord->id,
                'files_field' => $createdRecord->files,
                'files_is_array' => is_array($createdRecord->files),
                'files_count' => is_array($createdRecord->files) ? count($createdRecord->files) : 0
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Printing request submitted successfully',
                'data' => $printingRequest,
                'tracking_number' => $printingRequest->tracking_number
            ], 201);

        } catch (\Exception $e) {
            Log::error('Store method error:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to submit printing request',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Upload files for printing request (separate endpoint)
     */
    public function uploadFiles(Request $request)
    {
        try {
            Log::info('UploadFiles method called', [
                'tracking_number' => $request->tracking_number,
                'has_files' => $request->hasFile('files')
            ]);
            
            $validator = Validator::make($request->all(), [
                'tracking_number' => 'required|exists:file_printing_requests,tracking_number',
                'files' => 'required|array|min:1|max:10',
                'files.*' => 'required|file|max:10240' // 10MB max
            ]);

            if ($validator->fails()) {
                Log::warning('UploadFiles validation failed:', ['errors' => $validator->errors()]);
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $printingRequest = FilePrintingRequest::where('tracking_number', $request->tracking_number)->firstOrFail();
            
            Log::info('Found request:', [
                'id' => $printingRequest->id,
                'current_files' => $printingRequest->files
            ]);
            
            $uploadedFiles = [];
            foreach ($request->file('files') as $file) {
                $filename = Str::random(20) . '_' . time() . '.' . $file->getClientOriginalExtension();
                $path = $file->storeAs('printing-requests', $filename, 'public');
                
                $uploadedFiles[] = [
                    'original_name' => $file->getClientOriginalName(),
                    'filename' => $filename,
                    'path' => $path,
                    'size' => $file->getSize(),
                    'mime_type' => $file->getMimeType(),
                    'uploaded_at' => now()->toDateTimeString()
                ];
            }

            // Update request with ALL uploaded files (not merge, replace)
            $printingRequest->update([
                'files' => $uploadedFiles
            ]);

            // Reload to verify
            $printingRequest->refresh();
            
            Log::info('Files updated:', [
                'id' => $printingRequest->id,
                'new_files' => $printingRequest->files,
                'files_count' => count($printingRequest->files)
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Files uploaded successfully',
                'data' => $uploadedFiles
            ]);

        } catch (\Exception $e) {
            Log::error('UploadFiles error:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to upload files',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update printing request status (admin)
     */
    public function updateStatus(Request $request, $id)
    {
        try {
            Log::info('UpdateStatus called', ['id' => $id, 'data' => $request->all()]);
            
            $printingRequest = FilePrintingRequest::findOrFail($id);
            
            $validator = Validator::make($request->all(), [
                'status' => 'required|in:pending,processing,ready,completed,cancelled',
                'admin_notes' => 'nullable|string'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $validated = $validator->validated();
            
            // Update timestamps based on status
            $status = $validated['status'];
            $updates = ['status' => $status];
            
            if ($status === 'processing' && !$printingRequest->processed_at) {
                $updates['processed_at'] = now();
                $updates['processed_by'] = auth()->id();
            } elseif ($status === 'ready' && !$printingRequest->ready_at) {
                $updates['ready_at'] = now();
            } elseif ($status === 'completed' && !$printingRequest->completed_at) {
                $updates['completed_at'] = now();
            }
            
            if (isset($validated['admin_notes'])) {
                $updates['admin_notes'] = $validated['admin_notes'];
            }

            $printingRequest->update($updates);

            return response()->json([
                'success' => true,
                'message' => 'Printing request status updated successfully',
                'data' => $printingRequest
            ]);

        } catch (\Exception $e) {
            Log::error('UpdateStatus error:', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to update status',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get single printing request
     */
    public function show($id)
    {
        try {
            $request = FilePrintingRequest::findOrFail($id);
            
            Log::info('Show method:', [
                'id' => $id,
                'has_files' => !empty($request->files),
                'files_count' => is_array($request->files) ? count($request->files) : 0
            ]);
            
            return response()->json([
                'success' => true,
                'data' => $request
            ]);
            
        } catch (\Exception $e) {
            Log::error('Show method error:', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Printing request not found'
            ], 404);
        }
    }

    /**
     * Delete printing request (admin)
     */
    public function destroy($id)
    {
        try {
            $request = FilePrintingRequest::findOrFail($id);
            
            // Delete uploaded files
            if ($request->files && is_array($request->files)) {
                foreach ($request->files as $file) {
                    if (isset($file['path'])) {
                        Storage::disk('public')->delete($file['path']);
                    }
                }
            }
            
            $request->delete();

            return response()->json([
                'success' => true,
                'message' => 'Printing request deleted successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Destroy error:', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete printing request',
                'error' => $e->getMessage()
            ], 500);
        }
    }

/**
 * Download file from printing request
 */
public function downloadFile($id, $filename)
{
    try {
        Log::info('DownloadFile called', ['id' => $id, 'filename' => $filename]);
        
        $request = FilePrintingRequest::findOrFail($id);
        
        // Find the file in the files array
        $file = null;
        $files = is_array($request->files) ? $request->files : [];
        
        foreach ($files as $f) {
            if (isset($f['filename']) && $f['filename'] === $filename) {
                $file = $f;
                break;
            }
        }
        
        if (!$file || !isset($file['path'])) {
            Log::warning('File not found for download', ['id' => $id, 'filename' => $filename]);
            abort(404, 'File not found');
        }
        
        $path = $file['path'];
        $originalName = $file['original_name'] ?? $filename;
        
        if (!Storage::disk('public')->exists($path)) {
            Log::warning('File path does not exist', ['path' => $path]);
            
            // Try alternative path format
            $altPath = str_replace('printing-requests/', '', $path);
            if (Storage::disk('public')->exists($altPath)) {
                $path = $altPath;
                Log::info('Found file with alternative path', ['path' => $path]);
            } else {
                abort(404, 'File does not exist on server');
            }
        }
        
        // Get file info for logging
        $fileInfo = [
            'path' => $path,
            'original_name' => $originalName,
            'size' => Storage::disk('public')->size($path),
            'mime_type' => Storage::disk('public')->mimeType($path)
        ];
        
        Log::info('Downloading file info:', $fileInfo);
        
        // Set proper headers for download
        $headers = [
            'Content-Type' => $fileInfo['mime_type'],
            'Content-Disposition' => 'attachment; filename="' . $originalName . '"',
            'Content-Length' => $fileInfo['size']
        ];
        
        // Return the file with proper headers
        return response()->file(
            Storage::disk('public')->path($path),
            $headers
        );
        
    } catch (\Exception $e) {
        Log::error('DownloadFile error:', [
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ]);
        return response()->json([
            'success' => false,
            'message' => 'Failed to download file',
            'error' => $e->getMessage()
        ], 500);
    }
}

/**
 * Get direct file access URL (for testing)
 */
public function getFileUrl($id, $filename)
{
    try {
        $request = FilePrintingRequest::findOrFail($id);
        
        // Find the file
        $file = null;
        foreach ($request->files ?? [] as $f) {
            if (isset($f['filename']) && $f['filename'] === $filename) {
                $file = $f;
                break;
            }
        }
        
        if (!$file || !isset($file['path'])) {
            abort(404, 'File not found');
        }
        
        $path = $file['path'];
        
        if (!Storage::disk('public')->exists($path)) {
            abort(404, 'File does not exist');
        }
        
        // Generate public URL
        $url = Storage::disk('public')->url($path);
        
        return response()->json([
            'success' => true,
            'url' => $url,
            'direct_link' => url($url),
            'file' => $file
        ]);
        
    } catch (\Exception $e) {
        Log::error('GetFileUrl error:', ['error' => $e->getMessage()]);
        return response()->json([
            'success' => false,
            'message' => 'Failed to get file URL'
        ], 500);
    }
}

    /**
     * Check printing request status (public)
     */
    public function checkStatus(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'tracking_number' => 'required|exists:file_printing_requests,tracking_number',
                'contact_number' => 'required|string'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid tracking number or contact number'
                ], 404);
            }

            $printingRequest = FilePrintingRequest::where('tracking_number', $request->tracking_number)
                ->where('contact_number', $request->contact_number)
                ->first();

            if (!$printingRequest) {
                return response()->json([
                    'success' => false,
                    'message' => 'No printing request found with provided details'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $printingRequest
            ]);

        } catch (\Exception $e) {
            Log::error('CheckStatus error:', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to check status',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Test endpoint to debug file storage
     */
    public function testFiles()
    {
        try {
            $requests = FilePrintingRequest::all();
            
            $result = [];
            foreach ($requests as $request) {
                $result[] = [
                    'id' => $request->id,
                    'tracking' => $request->tracking_number,
                    'files_field' => $request->files,
                    'files_type' => gettype($request->files),
                    'files_json' => json_encode($request->files),
                    'files_count' => is_array($request->files) ? count($request->files) : 0,
                    'created_at' => $request->created_at
                ];
            }
            
            Log::info('TestFiles endpoint called', ['total_requests' => count($result)]);
            
            return response()->json([
                'success' => true,
                'data' => $result
            ]);
            
        } catch (\Exception $e) {
            Log::error('TestFiles error:', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Test failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get statistics
     */
    private function getStatistics()
    {
        return [
            'total' => FilePrintingRequest::count(),
            'pending' => FilePrintingRequest::where('status', 'pending')->count(),
            'processing' => FilePrintingRequest::where('status', 'processing')->count(),
            'ready' => FilePrintingRequest::where('status', 'ready')->count(),
            'completed' => FilePrintingRequest::where('status', 'completed')->count(),
            'cancelled' => FilePrintingRequest::where('status', 'cancelled')->count(),
            'today' => FilePrintingRequest::whereDate('submitted_at', today())->count(),
            'this_week' => FilePrintingRequest::whereBetween('submitted_at', [now()->startOfWeek(), now()->endOfWeek()])->count(),
            'this_month' => FilePrintingRequest::whereMonth('submitted_at', now()->month)
                ->whereYear('submitted_at', now()->year)
                ->count()
        ];
    }
}