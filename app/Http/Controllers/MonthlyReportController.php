<?php
// app/Http/Controllers/MonthlyReportController.php

namespace App\Http\Controllers;

use App\Models\MonthlyReport;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class MonthlyReportController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = MonthlyReport::where('status', 'published');

        // Search filter
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
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

    public function show($id): JsonResponse
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

    public function filters(): JsonResponse
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

    public function statistics(): JsonResponse
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

    // Admin methods - protected by auth
    public function adminIndex(Request $request): JsonResponse
    {
        $query = MonthlyReport::query();

        // Search filter
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
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

    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'content' => 'required|string',
            'month' => 'required|string',
            'year' => 'required|integer|min:2020|max:' . (date('Y') + 1),
            'category' => 'required|string',
            'tags' => 'nullable|string',
            'status' => 'required|in:draft,published'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $report = MonthlyReport::create([
            'title' => $request->title,
            'description' => $request->description,
            'content' => $request->content,
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

        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'content' => 'required|string',
            'month' => 'required|string',
            'year' => 'required|integer|min:2020|max:' . (date('Y') + 1),
            'category' => 'required|string',
            'tags' => 'nullable|string',
            'status' => 'required|in:draft,published'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $report->update([
            'title' => $request->title,
            'description' => $request->description,
            'content' => $request->content,
            'month' => $request->month,
            'year' => $request->year,
            'category' => $request->category,
            'tags' => $request->tags ? array_map('trim', explode(',', $request->tags)) : [],
            'status' => $request->status
        ]);

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