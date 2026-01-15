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
                'files_count' => $request->hasFile('files') ? count($request->file('files')) : 0
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
                    'files.*' => 'required|file|max:10240|mimes:pdf,doc,docx,rtf,txt,jpg,jpeg,png,bmp,odt,ods,odp' // Add allowed mimes
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
                    $originalExtension = $file->getClientOriginalExtension();
                    $filename = Str::random(20) . '_' . time() . '.' . $originalExtension;
                    $path = $file->storeAs('printing-requests', $filename, 'public');
                    
                    // Verify the file was stored
                    if (!Storage::disk('public')->exists($path)) {
                        throw new \Exception("File storage failed: {$path}");
                    }
                    
                    // Get actual stored file info
                    $storedSize = Storage::disk('public')->size($path);
                    $storedMime = Storage::disk('public')->mimeType($path);
                    
                    // For DOCX files, ensure proper MIME type
                    if ($originalExtension === 'docx' && $storedMime !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
                        // Force correct MIME type for DOCX
                        $storedMime = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
                    }
                    
                    // For DOC files
                    if ($originalExtension === 'doc' && $storedMime !== 'application/msword') {
                        $storedMime = 'application/msword';
                    }
                    
                    Log::info('File storage verification:', [
                        'original_name' => $originalName,
                        'original_extension' => $originalExtension,
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
                        'size' => $storedSize,
                        'mime_type' => $storedMime,
                        'extension' => $originalExtension, // Store extension separately
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
                    'files' => $uploadedFiles
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
                    'files' => []
                ]);
            }
            
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
        Log::info('DownloadFile called', [
            'id' => $id, 
            'filename' => $filename,
            'auth_user' => auth()->id()
        ]);
        
        $request = FilePrintingRequest::findOrFail($id);
        
        // Debug: Log the files structure
        Log::info('Request files structure:', [
            'files_field' => $request->files,
            'files_type' => gettype($request->files),
            'files_json' => json_encode($request->files)
        ]);
        
        // Parse files if it's a string
        $files = $request->files;
        if (is_string($files)) {
            $files = json_decode($files, true);
        }
        
        if (!is_array($files)) {
            Log::warning('Files is not an array', ['files' => $files]);
            abort(404, 'No files found');
        }
        
        // Find the file
        $file = null;
        foreach ($files as $f) {
            Log::debug('Checking file:', [
                'file_filename' => $f['filename'] ?? null,
                'searching_for' => $filename
            ]);
            
            if (isset($f['filename']) && $f['filename'] === $filename) {
                $file = $f;
                break;
            }
        }
        
        if (!$file) {
            Log::warning('File not found in array', [
                'filename' => $filename,
                'available_files' => array_column($files, 'filename')
            ]);
            abort(404, 'File not found in request');
        }
        
        // Verify path exists
        $path = $file['path'] ?? null;
        if (!$path) {
            Log::warning('No path in file object', ['file' => $file]);
            abort(404, 'File path not specified');
        }
        
        Log::info('Attempting to download file:', [
            'path' => $path,
            'storage_path' => Storage::disk('public')->path($path),
            'exists' => Storage::disk('public')->exists($path)
        ]);
        
        // Check if file exists
        if (!Storage::disk('public')->exists($path)) {
            Log::warning('File does not exist at path:', [
                'path' => $path,
                'full_path' => Storage::disk('public')->path($path)
            ]);
            
            // Try to find the file in alternative locations
            $searchPaths = [
                $path,
                'printing-requests/' . basename($path),
                basename($path),
                str_replace('printing-requests/', '', $path)
            ];
            
            foreach ($searchPaths as $searchPath) {
                if (Storage::disk('public')->exists($searchPath)) {
                    $path = $searchPath;
                    Log::info('Found file at alternative path:', ['path' => $path]);
                    break;
                }
            }
            
            if (!Storage::disk('public')->exists($path)) {
                abort(404, 'File not found on server: ' . $path);
            }
        }
        
        // Get file details
        $fileSize = Storage::disk('public')->size($path);
        $mimeType = Storage::disk('public')->mimeType($path);
        $originalName = $file['original_name'] ?? $filename;
        
        Log::info('File details:', [
            'path' => $path,
            'size' => $fileSize,
            'mime_type' => $mimeType,
            'original_name' => $originalName
        ]);
        
        // Verify file is not empty
        if ($fileSize === 0) {
            Log::error('File is empty (0 bytes)', ['path' => $path]);
            abort(500, 'File is empty');
        }
        
        // Set headers for download
        $headers = [
            'Content-Type' => $mimeType,
            'Content-Disposition' => 'attachment; filename="' . $originalName . '"',
            'Content-Length' => $fileSize,
            'Cache-Control' => 'no-cache, no-store, must-revalidate',
            'Pragma' => 'no-cache',
            'Expires' => '0',
        ];
        
        Log::info('Download headers set:', $headers);
        
        // Return the file as download response
        return Storage::disk('public')->download($path, $originalName, $headers);
        
    } catch (\Exception $e) {
        Log::error('DownloadFile error:', [
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ]);
        
        return response()->json([
            'success' => false,
            'message' => 'Failed to download file: ' . $e->getMessage(),
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