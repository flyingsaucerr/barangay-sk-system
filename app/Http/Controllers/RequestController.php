<?php
// app/Http/Controllers/RequestController.php

namespace App\Http\Controllers;

use App\Models\Request;
use Illuminate\Http\Request as HttpRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class RequestController extends Controller
{
    /**
     * Submit a new request (Public)
     */
    public function store(HttpRequest $request): JsonResponse
    {
        try {
            Log::info('Request submission received', $request->all());

            $validator = Validator::make($request->all(), [
                'request_type' => 'required|in:solicitation,suggestion,change_request',
                'title' => 'required|string|max:255',
                'description' => 'required|string',
                'contact_name' => 'required|string|max:255',
                'contact_number' => 'required|string|max:20',
                'address' => 'required|string|max:500'
            ]);

            if ($validator->fails()) {
                Log::warning('Request validation failed', $validator->errors()->toArray());
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors()
                ], 422);
            }

            $newRequest = Request::create([
                'request_type' => $request->request_type,
                'title' => $request->title,
                'description' => $request->description,
                'contact_name' => $request->contact_name,
                'contact_number' => $request->contact_number,
                'address' => $request->address,
                'status' => 'pending'
            ]);

            Log::info('New request created successfully', [
                'id' => $newRequest->id,
                'type' => $newRequest->request_type,
                'title' => $newRequest->title
            ]);

            return response()->json([
                'success' => true,
                'data' => $newRequest,
                'message' => 'Your request has been submitted successfully! We will contact you soon.'
            ], 201);

        } catch (\Exception $e) {
            Log::error('Error submitting request: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to submit request. Please try again.'
            ], 500);
        }
    }

    /**
     * Get all requests for admin (Protected)
     */
    public function adminIndex(HttpRequest $request): JsonResponse
    {
        try {
            \Log::info('Admin requests accessed', [
                'user_id' => auth()->id(),
                'filters' => $request->all()
            ]);

            $query = Request::with(['assignedUser:id,name']);

            // Status filter
            if ($request->has('status') && $request->status !== 'all') {
                $query->where('status', $request->status);
            }

            // Type filter
            if ($request->has('type') && $request->type !== 'all') {
                $query->where('request_type', $request->type);
            }

            // Search filter
            if ($request->has('search') && $request->search) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%")
                      ->orWhere('contact_name', 'like', "%{$search}%");
                });
            }

            $requests = $query->orderBy('created_at', 'desc')->get();

            \Log::info('Returning requests', ['count' => $requests->count()]);

            return response()->json([
                'success' => true,
                'data' => $requests,
                'count' => $requests->count()
            ]);

        } catch (\Exception $e) {
            \Log::error('Error in adminIndex: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve requests'
            ], 500);
        }
    }

    /**
     * Get request statistics for admin (Protected)
     */
    public function adminStatistics(): JsonResponse
    {
        try {
            // Use direct where clauses instead of scopes to avoid potential scope issues
            $totalRequests = Request::count();
            $pendingRequests = Request::where('status', 'pending')->count();
            $inProgressRequests = Request::where('status', 'in_progress')->count();
            $completedRequests = Request::where('status', 'completed')->count();

            $requestsByType = [
                'solicitation' => Request::where('request_type', 'solicitation')->count(),
                'suggestion' => Request::where('request_type', 'suggestion')->count(),
                'change_request' => Request::where('request_type', 'change_request')->count(),
            ];

            return response()->json([
                'success' => true,
                'data' => [
                    'total_requests' => $totalRequests,
                    'pending_requests' => $pendingRequests,
                    'in_progress_requests' => $inProgressRequests,
                    'completed_requests' => $completedRequests,
                    'requests_by_type' => $requestsByType
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Error fetching request statistics: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve statistics'
            ], 500);
        }
    }

    /**
     * Update request status (Protected)
     */
    public function updateStatus(HttpRequest $request, $id): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'status' => 'required|in:pending,in_progress,completed,rejected',
                'assigned_to' => 'nullable|exists:users,id',
                'notes' => 'nullable|string'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors()
                ], 422);
            }

            $requestModel = Request::find($id);

            if (!$requestModel) {
                return response()->json([
                    'success' => false,
                    'message' => 'Request not found'
                ], 404);
            }

            $requestModel->update([
                'status' => $request->status,
                'assigned_to' => $request->assigned_to,
                'notes' => $request->notes
            ]);

            // Reload with relationships
            $requestModel->load('assignedUser:id,name');

            Log::info('Request status updated', [
                'id' => $requestModel->id,
                'status' => $requestModel->status,
                'assigned_to' => $requestModel->assigned_to
            ]);

            return response()->json([
                'success' => true,
                'data' => $requestModel,
                'message' => 'Request status updated successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Error updating request status: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to update request status'
            ], 500);
        }
    }

    /**
     * Get single request details for admin (Protected)
     */
    public function adminShow($id): JsonResponse
    {
        try {
            $request = Request::with('assignedUser:id,name')->find($id);

            if (!$request) {
                return response()->json([
                    'success' => false,
                    'message' => 'Request not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $request
            ]);

        } catch (\Exception $e) {
            Log::error('Error fetching request details: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve request details'
            ], 500);
        }
    }

    /**
     * Delete request (Protected)
     */
    public function destroy($id): JsonResponse
    {
        try {
            $request = Request::find($id);

            if (!$request) {
                return response()->json([
                    'success' => false,
                    'message' => 'Request not found'
                ], 404);
            }

            $request->delete();

            Log::info('Request deleted', ['id' => $id]);

            return response()->json([
                'success' => true,
                'message' => 'Request deleted successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Error deleting request: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete request'
            ], 500);
        }
    }
}