<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FilePrintingRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class FilePrintingController extends Controller
{
    /**
     * Get all printing requests (admin)
     */
    public function index(Request $request)
    {
        try {
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
            
            $requests = $query->orderBy('submitted_at', 'desc')->paginate(20);
            
            return response()->json([
                'success' => true,
                'data' => $requests,
                'statistics' => $this->getStatistics()
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch printing requests',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create new printing request (public)
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'requester_name' => 'required|string|max:255',
                'contact_number' => 'required|string|max:20',
                'email' => 'nullable|email|max:255',
                'notes' => 'nullable|string',
                'copies' => 'required|integer|min:1|max:10',
                'files' => 'required|array|min:1|max:10',
                'files.*.name' => 'required|string',
                'files.*.size' => 'required|integer',
                'files.*.type' => 'required|string'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $validated = $validator->validated();
            $validated['tracking_number'] = FilePrintingRequest::generateTrackingNumber();
            $validated['submitted_at'] = now();
            $validated['status'] = 'pending';

            $request = FilePrintingRequest::create($validated);

            return response()->json([
                'success' => true,
                'message' => 'Printing request submitted successfully',
                'data' => $request,
                'tracking_number' => $request->tracking_number
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to submit printing request',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Upload files for printing request
     */
    public function uploadFiles(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'tracking_number' => 'required|exists:file_printing_requests,tracking_number',
                'files' => 'required|array|min:1|max:10',
                'files.*' => 'required|file|max:10240' // 10MB max
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $printingRequest = FilePrintingRequest::where('tracking_number', $request->tracking_number)->first();
            
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

            // Update request with file info
            $printingRequest->update([
                'files' => array_merge($printingRequest->files ?? [], $uploadedFiles)
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Files uploaded successfully',
                'data' => $uploadedFiles
            ]);

        } catch (\Exception $e) {
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
            
            return response()->json([
                'success' => true,
                'data' => $request
            ]);
            
        } catch (\Exception $e) {
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
            if ($request->files) {
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
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete printing request',
                'error' => $e->getMessage()
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
            return response()->json([
                'success' => false,
                'message' => 'Failed to check status',
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