<?php

namespace App\Http\Controllers;

use App\Models\MonthlyReport;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;

class MonthlyReportController extends Controller
{
    // PUBLIC METHODS
    public function publicIndex(Request $request): JsonResponse
    {
        $query = MonthlyReport::where('status', 'published');

        // Search filter
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('description', 'like', "%{$search}%")
                  ->orWhereJsonContains('tags', $search);
            });
        }

        // Year filter
        if ($request->has('year') && $request->year !== 'all') {
            $query->where('year', $request->year);
        }

        // Month filter
        if ($request->has('month') && $request->month !== 'all') {
            $query->where('month', $request->month);
        }

        // Category filter
        if ($request->has('category') && $request->category !== 'all') {
            $query->where('category', $request->category);
        }

        $reports = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $reports
        ]);
    }

    public function publicShow($id): JsonResponse
    {
        $report = MonthlyReport::where('status', 'published')->find($id);

        if (!$report) {
            return response()->json([
                'success' => false,
                'message' => 'Report not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $report
        ]);
    }

    public function publicDownload($id)
    {
        $report = MonthlyReport::where('status', 'published')->find($id);

        if (!$report || !$report->file_path) {
            return response()->json([
                'success' => false,
                'message' => 'File not found'
            ], 404);
        }

        if (!Storage::disk('public')->exists($report->file_path)) {
            return response()->json([
                'success' => false,
                'message' => 'File not found on server'
            ], 404);
        }

        return Storage::disk('public')->download(
            $report->file_path,
            $report->file_name,
            ['Content-Type' => $report->file_type]
        );
    }

    public function publicFilters(): JsonResponse
    {
        $years = MonthlyReport::where('status', 'published')
            ->distinct('year')
            ->pluck('year')
            ->sortDesc()
            ->values();
        
        $months = MonthlyReport::where('status', 'published')
            ->distinct('month')
            ->pluck('month')
            ->values();
        
        $categories = MonthlyReport::where('status', 'published')
            ->distinct('category')
            ->pluck('category')
            ->values();

        return response()->json([
            'success' => true,
            'data' => [
                'years' => $years,
                'months' => $months,
                'categories' => $categories
            ]
        ]);
    }

    public function publicStatistics(): JsonResponse
    {
        $totalReports = MonthlyReport::where('status', 'published')->count();
        $thisYearReports = MonthlyReport::where('status', 'published')
            ->where('year', date('Y'))
            ->count();
        $categoriesCount = MonthlyReport::where('status', 'published')
            ->distinct('category')
            ->count('category');
        $yearsCovered = MonthlyReport::where('status', 'published')
            ->distinct('year')
            ->count('year');

        return response()->json([
            'success' => true,
            'data' => [
                'total_reports' => $totalReports,
                'this_year_reports' => $thisYearReports,
                'categories_count' => $categoriesCount,
                'years_covered' => $yearsCovered
            ]
        ]);
    }

    // ADMIN METHODS - protected by auth
    public function adminIndex(Request $request): JsonResponse
    {
        $query = MonthlyReport::query();

        // Search filter
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('description', 'like', "%{$search}%")
                  ->orWhereJsonContains('tags', $search);
            });
        }

        // Year filter
        if ($request->has('year') && $request->year !== 'all') {
            $query->where('year', $request->year);
        }

        // Month filter
        if ($request->has('month') && $request->month !== 'all') {
            $query->where('month', $request->month);
        }

        $reports = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $reports
        ]);
    }

    public function adminShow($id): JsonResponse
    {
        $report = MonthlyReport::find($id);

        if (!$report) {
            return response()->json([
                'success' => false,
                'message' => 'Report not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $report
        ]);
    }

    public function adminDownload($id)
    {
        $report = MonthlyReport::find($id);

        if (!$report || !$report->file_path) {
            return response()->json([
                'success' => false,
                'message' => 'File not found'
            ], 404);
        }

        if (!Storage::disk('public')->exists($report->file_path)) {
            return response()->json([
                'success' => false,
                'message' => 'File not found on server'
            ], 404);
        }

        return Storage::disk('public')->download(
            $report->file_path,
            $report->file_name,
            ['Content-Type' => $report->file_type]
        );
    }

    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'description' => 'required|string',
            'month' => 'required|string',
            'year' => 'required|integer|min:2020|max:' . (date('Y') + 1),
            'category' => 'required|string',
            'tags' => 'nullable|string',
            'status' => 'required|in:draft,published',
            'file' => 'required|file|mimes:doc,docx,xls,xlsx,pdf|max:51200' // 50MB max
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        // Handle file upload
        $file = $request->file('file');
        $fileName = time() . '_' . $file->getClientOriginalName();
        $filePath = $file->storeAs('monthly-reports', $fileName, 'public');

        $report = MonthlyReport::create([
            'title' => $request->description, // Use description as title for backward compatibility
            'description' => $request->description,
            'content' => '', // Empty content since we're using files
            'file_path' => $filePath,
            'file_name' => $file->getClientOriginalName(),
            'file_type' => $file->getMimeType(),
            'file_size' => $file->getSize(),
            'month' => $request->month,
            'year' => $request->year,
            'category' => $request->category,
            'author' => $request->user()->name ?? 'Admin User',
            'upload_date' => now(),
            'tags' => $request->tags ? array_map('trim', explode(',', $request->tags)) : [],
            'status' => $request->status
        ]);

        return response()->json([
            'success' => true,
            'data' => $report,
            'message' => 'Report created successfully'
        ], 201);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $report = MonthlyReport::find($id);

        if (!$report) {
            return response()->json([
                'success' => false,
                'message' => 'Report not found'
            ], 404);
        }

        $rules = [
            'description' => 'required|string',
            'month' => 'required|string',
            'year' => 'required|integer|min:2020|max:' . (date('Y') + 1),
            'category' => 'required|string',
            'tags' => 'nullable|string',
            'status' => 'required|in:draft,published'
        ];

        // Add file validation only if a new file is uploaded - 50MB max
        if ($request->hasFile('file')) {
            $rules['file'] = 'file|mimes:doc,docx,xls,xlsx,pdf|max:51200'; // 50MB max
        }

        $validator = Validator::make($request->all(), $rules);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $updateData = [
            'title' => $request->description,
            'description' => $request->description,
            'month' => $request->month,
            'year' => $request->year,
            'category' => $request->category,
            'tags' => $request->tags ? array_map('trim', explode(',', $request->tags)) : [],
            'status' => $request->status
        ];

        // Handle file upload if a new file is provided
        if ($request->hasFile('file')) {
            // Delete old file
            if ($report->file_path && Storage::disk('public')->exists($report->file_path)) {
                Storage::disk('public')->delete($report->file_path);
            }

            $file = $request->file('file');
            $fileName = time() . '_' . $file->getClientOriginalName();
            $filePath = $file->storeAs('monthly-reports', $fileName, 'public');

            $updateData['file_path'] = $filePath;
            $updateData['file_name'] = $file->getClientOriginalName();
            $updateData['file_type'] = $file->getMimeType();
            $updateData['file_size'] = $file->getSize();
        }

        $report->update($updateData);

        return response()->json([
            'success' => true,
            'data' => $report,
            'message' => 'Report updated successfully'
        ]);
    }


    public function destroy($id): JsonResponse
    {
        $report = MonthlyReport::find($id);

        if (!$report) {
            return response()->json([
                'success' => false,
                'message' => 'Report not found'
            ], 404);
        }

        // Delete associated file
        if ($report->file_path && Storage::disk('public')->exists($report->file_path)) {
            Storage::disk('public')->delete($report->file_path);
        }

        $report->delete();

        return response()->json([
            'success' => true,
            'message' => 'Report deleted successfully'
        ]);
    }

    public function adminFilters(): JsonResponse
    {
        $years = MonthlyReport::distinct('year')
            ->pluck('year')
            ->sortDesc()
            ->values();
        
        $months = MonthlyReport::distinct('month')
            ->pluck('month')
            ->values();
        
        $categories = MonthlyReport::distinct('category')
            ->pluck('category')
            ->values();

        return response()->json([
            'success' => true,
            'data' => [
                'years' => $years,
                'months' => $months,
                'categories' => $categories
            ]
        ]);
    }

    public function adminStatistics(): JsonResponse
    {
        $totalReports = MonthlyReport::count();
        $thisYearReports = MonthlyReport::where('year', date('Y'))->count();
        $categoriesCount = MonthlyReport::distinct('category')->count('category');
        $publishedReports = MonthlyReport::where('status', 'published')->count();

        return response()->json([
            'success' => true,
            'data' => [
                'total_reports' => $totalReports,
                'this_year_reports' => $thisYearReports,
                'categories_count' => $categoriesCount,
                'published_reports' => $publishedReports
            ]
        ]);
    }
}