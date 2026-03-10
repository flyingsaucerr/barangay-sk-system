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
            $user = auth()->user();
            \Log::info('Admin requests accessed', [
                'user_id' => $user->id,
                'user_role' => $user->role,
                'filters' => $request->all()
            ]);

            $query = Request::with(['assignedUser:id,name']);

            // Role-based filtering
            if ($user->role === 'staff') {
                // Staff can only see requests assigned to them
                $query->where('assigned_to', $user->id);
            } elseif ($user->role === 'admin') {
                // Admin can see all requests
                // No filter needed
            } else {
                // Other roles (like resident) shouldn't access this
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized access'
                ], 403);
            }

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

            // Date range filter
            if ($request->has('start_date') && $request->has('end_date') && $request->start_date && $request->end_date) {
                $startDate = $request->start_date . ' 00:00:00';
                $endDate = $request->end_date . ' 23:59:59';
                
                $query->whereBetween('created_at', [$startDate, $endDate]);
                
                \Log::info('Date filter applied', [
                    'start_date' => $startDate,
                    'end_date' => $endDate
                ]);
            }

            // Assignment filter for admin
            if ($user->role === 'admin' && $request->has('assigned') && $request->assigned !== 'all') {
                if ($request->assigned === 'assigned') {
                    $query->whereNotNull('assigned_to');
                } elseif ($request->assigned === 'unassigned') {
                    $query->whereNull('assigned_to');
                }
            }

            $requests = $query->orderBy('created_at', 'desc')->get();

            \Log::info('Returning requests', [
                'count' => $requests->count(),
                'user_role' => $user->role,
                'user_id' => $user->id,
                'total_in_db' => Request::count()
            ]);

            return response()->json([
                'success' => true,
                'data' => $requests,
                'count' => $requests->count(),
                'user_role' => $user->role // Include user role in response
            ]);

        } catch (\Exception $e) {
            \Log::error('Error in adminIndex: ' . $e->getMessage());
            \Log::error('Stack trace: ' . $e->getTraceAsString());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve requests: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get request statistics for admin (Protected)
     */
    public function adminStatistics(HttpRequest $request): JsonResponse
    {
        try {
            $user = auth()->user();
            
            // Base query with role-based filtering
            $baseQuery = Request::query();
            
            if ($user->role === 'staff') {
                $baseQuery->where('assigned_to', $user->id);
            } elseif ($user->role === 'admin') {
                // Admin sees all
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized access'
                ], 403);
            }

            // Apply date filters to statistics if provided
            if ($request->has('start_date') && $request->has('end_date') && $request->start_date && $request->end_date) {
                $startDate = $request->start_date . ' 00:00:00';
                $endDate = $request->end_date . ' 23:59:59';
                
                $baseQuery->whereBetween('created_at', [$startDate, $endDate]);
            }

            $totalRequests = $baseQuery->count();
            $pendingRequests = (clone $baseQuery)->where('status', 'pending')->count();
            $inProgressRequests = (clone $baseQuery)->where('status', 'in_progress')->count();
            $completedRequests = (clone $baseQuery)->where('status', 'completed')->count();
            $rejectedRequests = (clone $baseQuery)->where('status', 'rejected')->count();

            $requestsByType = [
                'solicitation' => (clone $baseQuery)->where('request_type', 'solicitation')->count(),
                'suggestion' => (clone $baseQuery)->where('request_type', 'suggestion')->count(),
                'change_request' => (clone $baseQuery)->where('request_type', 'change_request')->count(),
            ];

            return response()->json([
                'success' => true,
                'data' => [
                    'total_requests' => $totalRequests,
                    'pending_requests' => $pendingRequests,
                    'in_progress_requests' => $inProgressRequests,
                    'completed_requests' => $completedRequests,
                    'rejected_requests' => $rejectedRequests,
                    'requests_by_type' => $requestsByType,
                    'user_role' => $user->role
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Error fetching request statistics: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            
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
            // Get the current request
            $requestModel = Request::find($id);
            
            if (!$requestModel) {
                return response()->json([
                    'success' => false,
                    'message' => 'Request not found'
                ], 404);
            }

            // Make status optional - use existing status if not provided
            $validator = Validator::make($request->all(), [
                'status' => 'sometimes|in:pending,in_progress,completed,rejected',
                'assigned_to' => 'nullable|integer|exists:users,id',
                'notes' => 'nullable|string'
            ]);

            if ($validator->fails()) {
                Log::warning('Update status validation failed', [
                    'errors' => $validator->errors()->toArray(),
                    'input' => $request->all()
                ]);
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors()
                ], 422);
            }

            // Prepare update data
            $updateData = [];
            
            // Only update fields that are provided
            if ($request->has('status')) {
                $updateData['status'] = $request->status;
            }
            
            if ($request->has('notes')) {
                $updateData['notes'] = $request->notes;
            }
            
            if ($request->has('assigned_to')) {
                $updateData['assigned_to'] = $request->assigned_to ?: null;
            }

            $requestModel->update($updateData);

            // Reload with relationships
            $requestModel->load('assignedUser:id,name');

            Log::info('Request updated', [
                'id' => $requestModel->id,
                'status' => $requestModel->status,
                'assigned_to' => $requestModel->assigned_to,
                'notes' => $requestModel->notes,
                'updated_fields' => array_keys($updateData)
            ]);

            return response()->json([
                'success' => true,
                'data' => $requestModel,
                'message' => 'Request updated successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Error updating request: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to update request'
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

    /**
     * Get all staff users for assignment (Protected - Admin only)
     */
    public function getStaffUsers(): JsonResponse
    {
        try {
            $user = auth()->user();
            
            // Only admins can access this endpoint
            if ($user->role !== 'admin') {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized access'
                ], 403);
            }
            
            // Get only staff users (exclude admins)
            $staffUsers = \App\Models\User::where('role', 'staff')
                ->select('id', 'name', 'username', 'role', 'contact_number')
                ->orderBy('name')
                ->get();

            Log::info('Staff users fetched', [
                'count' => $staffUsers->count(),
                'requested_by' => $user->id,
                'role' => $user->role
            ]);

            return response()->json([
                'success' => true,
                'data' => $staffUsers,
                'count' => $staffUsers->count()
            ]);

        } catch (\Exception $e) {
            Log::error('Error fetching staff users: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve staff users'
            ], 500);
        }
    }
}