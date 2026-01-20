<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\RegisterController; 
use App\Http\Controllers\AnnouncementController;
use App\Http\Controllers\FacilityController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\RequestController;
use App\Http\Controllers\AccomplishmentController;
use App\Http\Controllers\DisclosureController;
use App\Http\Controllers\MonthlyReportController;
use App\Http\Controllers\KKIDProfileController;
use App\Http\Controllers\FilePrintingController;
use App\Http\Controllers\UserController;

Route::options('/{any}', function () {
    return response('', 200)
        ->header('Access-Control-Allow-Origin', 'http://localhost:3000')
        ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
        ->header('Access-Control-Allow-Credentials', 'true');
})->where('any', '.*');

// DEBUG ROUTES
Route::get('/debug-routes', function() {
    $routes = collect(Route::getRoutes()->getRoutes())
        ->filter(fn($route) => str_starts_with($route->uri(), 'api/'))
        ->map(fn($route) => [
            'uri' => $route->uri(),
            'methods' => $route->methods(),
            'name' => $route->getName(),
            'middleware' => $route->gatherMiddleware(),
        ]);
    
    return response()->json($routes->values());
});

Route::get('/debug-test', function() {
    return response()->json([
        'success' => true,
        'message' => 'API is working!',
        'timestamp' => now()
    ]);
});

// Add to your routes/api.php
Route::get('/admin/printing/debug/file-storage', function () {
    try {
        // List all files in printing-requests directory
        $files = Storage::disk('public')->allFiles('printing-requests');
        
        $fileDetails = [];
        foreach ($files as $file) {
            $fileDetails[] = [
                'path' => $file,
                'size' => Storage::disk('public')->size($file),
                'mime_type' => Storage::disk('public')->mimeType($file),
                'url' => Storage::disk('public')->url($file),
                'exists' => Storage::disk('public')->exists($file)
            ];
        }
        
        // Get all printing requests
        $requests = \App\Models\FilePrintingRequest::all();
        $requestFiles = [];
        
        foreach ($requests as $request) {
            $files = $request->files;
            if (is_string($files)) {
                $files = json_decode($files, true);
            }
            
            $requestFiles[] = [
                'id' => $request->id,
                'tracking' => $request->tracking_number,
                'files' => $files,
                'files_count' => is_array($files) ? count($files) : 0
            ];
        }
        
        return response()->json([
            'success' => true,
            'storage_files' => $fileDetails,
            'requests' => $requestFiles
        ]);
        
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => $e->getMessage()
        ], 500);
    }
});

// Authentication routes
Route::post('/login', [LoginController::class, 'login']);
Route::post('/logout', [LoginController::class, 'logout'])->middleware('auth:sanctum');
Route::get('/check-auth', [LoginController::class, 'checkAuth']);

// Registration routes - should be public (outside auth middleware)
Route::post('/register', [RegisterController::class, 'register']);
Route::post('/check-username', [RegisterController::class, 'checkUsername']);
Route::get('/user', [UserController::class, 'getCurrentUser'])->middleware('auth:sanctum');

Route::get('/login', function () {
    return response()->json([
        'message' => 'Please use POST /api/login to authenticate'
    ]);
})->name('login');

// Public APIs (No authentication required)
Route::middleware('api')->group(function () {
    // Public content
    Route::get('/announcements', [AnnouncementController::class, 'index']);
    Route::get('/facilities', [FacilityController::class, 'index']);
    Route::get('/accomplishments', [AccomplishmentController::class, 'index']);
    Route::get('/accomplishments/{id}', [AccomplishmentController::class, 'show']);
    Route::get('/projects', [ProjectController::class, 'index']);
    Route::get('/projects/{id}', [ProjectController::class, 'show']);
    Route::get('/disclosures', [DisclosureController::class, 'index']);
    Route::get('/disclosures/{disclosure}', [DisclosureController::class, 'show']);

    // Monthly Reports Public APIs
    Route::get('/monthly-reports', [MonthlyReportController::class, 'publicIndex']);
    Route::get('/monthly-reports/{id}', [MonthlyReportController::class, 'publicShow']);
    Route::get('/monthly-reports-filters', [MonthlyReportController::class, 'publicFilters']);
    Route::get('/monthly-reports-statistics', [MonthlyReportController::class, 'publicStatistics']);

    // Request Submission (Public - anyone can submit without auth)
    Route::post('/requests', [RequestController::class, 'store']);

    // File Printing
    Route::prefix('printing')->group(function () {
    Route::post('/submit', [FilePrintingController::class, 'store']);
    Route::post('/submit-with-files', [FilePrintingController::class, 'storeWithFiles']);
    Route::post('/upload-files', [FilePrintingController::class, 'uploadFiles']);
    Route::post('/check-status', [FilePrintingController::class, 'checkStatus']);
});
});

// Protected APIs (Admin only - require auth)
Route::middleware('auth:sanctum')->group(function () {
    // Add registration stats route for admin only
    Route::get('/registration-stats', [RegisterController::class, 'stats'])->middleware('admin');
    
    // Announcements Admin
    Route::post('/announcements', [AnnouncementController::class, 'store']);
    Route::put('/announcements/{id}', [AnnouncementController::class, 'update']);
    Route::delete('/announcements/{id}', [AnnouncementController::class, 'destroy']);
    
    // Facilities Admin
    Route::post('/facilities', [FacilityController::class, 'store']);
    Route::put('/facilities/{id}', [FacilityController::class, 'update']);
    Route::delete('/facilities/{id}', [FacilityController::class, 'destroy']);

    // Projects Admin
    Route::post('/projects', [ProjectController::class, 'store']);
    Route::put('/projects/{id}', [ProjectController::class, 'update']);
    Route::delete('/projects/{id}', [ProjectController::class, 'destroy']);

    // Requests Management (Admin only)
    
    Route::prefix('admin')->group(function () {
        Route::get('/staff', [RequestController::class, 'getStaffUsers']);
        Route::get('/requests', [RequestController::class, 'adminIndex']);
        Route::get('/requests/statistics', [RequestController::class, 'adminStatistics']);
        Route::get('/requests/{id}', [RequestController::class, 'adminShow']);
        Route::put('/requests/{id}/status', [RequestController::class, 'updateStatus']);
        Route::delete('/requests/{id}', [RequestController::class, 'destroy']);
        Route::get('/staff', [RequestController::class, 'getStaffUsers']);
    });

    // Accomplishments Admin
    Route::post('/accomplishments', [AccomplishmentController::class, 'store']);
    Route::put('/accomplishments/{id}', [AccomplishmentController::class, 'update']);
    Route::delete('/accomplishments/{id}', [AccomplishmentController::class, 'destroy']);

    // Disclosure Board Admin
    Route::post('/disclosures', [DisclosureController::class, 'store']);
    Route::put('/disclosures/{disclosure}', [DisclosureController::class, 'update']);
    Route::delete('/disclosures/{disclosure}', [DisclosureController::class, 'destroy']);

    // Monthly Reports Admin APIs
    Route::prefix('admin')->group(function () {
        Route::get('/monthly-reports', [MonthlyReportController::class, 'adminIndex']);
        Route::get('/monthly-reports-filters', [MonthlyReportController::class, 'adminFilters']);
        Route::get('/monthly-reports-statistics', [MonthlyReportController::class, 'adminStatistics']);
        Route::post('/monthly-reports', [MonthlyReportController::class, 'store']);
        Route::get('/monthly-reports/{id}', [MonthlyReportController::class, 'adminShow']);
        Route::put('/monthly-reports/{id}', [MonthlyReportController::class, 'update']);
        Route::delete('/monthly-reports/{id}', [MonthlyReportController::class, 'destroy']);
    });

    // KKID Profiles 
    Route::prefix('kkid-profiles')->group(function () {
        Route::get('/', [KKIDProfileController::class, 'index']);
        Route::post('/', [KKIDProfileController::class, 'store']);
        Route::get('/{id}', [KKIDProfileController::class, 'show']);
        Route::put('/{id}', [KKIDProfileController::class, 'update']);
        Route::delete('/{id}', [KKIDProfileController::class, 'destroy']);
        Route::patch('/{id}/status', [KKIDProfileController::class, 'updateStatus']);
        Route::get('/kkid-profiles/{id}/generate-id', [KKIDController::class, 'generateID']);
    });

    // File Printing
Route::prefix('admin/printing')->group(function () {
    Route::get('/', [FilePrintingController::class, 'index']);
    Route::get('/{id}', [FilePrintingController::class, 'show']);
    Route::get('/{id}/download/{filename}', [FilePrintingController::class, 'downloadFile']); // This is the download route
    Route::get('/{id}/file/{filename}/url', [FilePrintingController::class, 'getFileUrl']);
    Route::get('/debug/file-storage', [FilePrintingController::class, 'debugFileStorage']); // Add debug route
    Route::patch('/{id}/status', [FilePrintingController::class, 'updateStatus']);
    Route::delete('/{id}', [FilePrintingController::class, 'destroy']);
});
});