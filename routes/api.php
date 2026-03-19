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
use App\Http\Controllers\AchievementController;
use App\Http\Controllers\FeedbackController;
use App\Http\Controllers\KagawadController;

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

// PUBLIC ROUTES - NO AUTHENTICATION REQUIRED
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

Route::get('/public/stats', function() {
    return response()->json([
        'completed_requests' => \App\Models\Request::where('status', 'completed')->count(),
        'active_projects' => \App\Models\Project::where('status', 'active')->count(),
        'accomplishments' => \App\Models\Accomplishment::count(),
    ]);
});

// PUBLIC FEEDBACK SUBMISSION - NO AUTH REQUIRED
Route::post('/feedback', [FeedbackController::class, 'store']);

// Public APIs (No authentication required)
Route::middleware('api')->group(function () {
    // Public content
    Route::get('/kagawad/featured', [KagawadController::class, 'getFeatured']);
    Route::get('/kagawad', [KagawadController::class, 'index']);
    Route::get('/announcements', [AnnouncementController::class, 'index']);
    Route::get('/facilities', [FacilityController::class, 'index']);
    Route::get('/accomplishments', [AccomplishmentController::class, 'publicIndex']);
    Route::get('/accomplishments/{id}', [AccomplishmentController::class, 'publicShow']);
    Route::get('/projects', [ProjectController::class, 'index']);
    Route::get('/projects/{id}', [ProjectController::class, 'show']);
    Route::get('/disclosures', [DisclosureController::class, 'index']);
    Route::get('/disclosures/{disclosure}', [DisclosureController::class, 'show']);

    // Monthly Reports Public APIs - REMOVED extra /api prefix
    Route::get('/monthly-reports', [MonthlyReportController::class, 'publicIndex']);
    Route::get('/monthly-reports/{id}', [MonthlyReportController::class, 'publicShow']);
    Route::get('/monthly-reports/{id}/download', [MonthlyReportController::class, 'publicDownload']);
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
    
    Route::get('/achievements', [AchievementController::class, 'index']);
    Route::post('/achievements', [AchievementController::class, 'store']);
    Route::put('/achievements/{id}', [AchievementController::class, 'update']);
    Route::delete('/achievements/{id}', [AchievementController::class, 'destroy']);
});


// PROTECTED ROUTES (Admin only - require auth)
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/registration-stats', [RegisterController::class, 'stats'])->middleware('admin');
    
    Route::post('/kagawad', [KagawadController::class, 'store']);
    Route::put('/kagawad/{id}', [KagawadController::class, 'update']);
    Route::delete('/kagawad/{id}', [KagawadController::class, 'destroy']);
    Route::post('/kagawad/{id}/set-featured', [KagawadController::class, 'setFeatured']);
    Route::post('/kagawad/{kagawadId}/activities', [KagawadController::class, 'addActivity']);
    Route::delete('/kagawad/activities/{id}', [KagawadController::class, 'deleteActivity']);

    Route::post('/announcements', [AnnouncementController::class, 'store']);
    Route::put('/announcements/{id}', [AnnouncementController::class, 'update']);
    Route::delete('/announcements/{id}', [AnnouncementController::class, 'destroy']);
    Route::get('/announcements/debug-image/{id}', [AnnouncementController::class, 'debugImage'])->middleware('auth:sanctum');
    
    Route::post('/facilities', [FacilityController::class, 'store']);
    Route::put('/facilities/{id}', [FacilityController::class, 'update']);
    Route::delete('/facilities/{id}', [FacilityController::class, 'destroy']);

    Route::post('/projects', [ProjectController::class, 'store']);
    Route::put('/projects/{id}', [ProjectController::class, 'update']);
    Route::delete('/projects/{id}', [ProjectController::class, 'destroy']);

    Route::prefix('admin')->group(function () {
        Route::get('/staff', [RequestController::class, 'getStaffUsers']);
        Route::get('/requests', [RequestController::class, 'adminIndex']);
        Route::get('/requests/statistics', [RequestController::class, 'adminStatistics']);
        Route::get('/requests/{id}', [RequestController::class, 'adminShow']);
        Route::put('/requests/{id}/status', [RequestController::class, 'updateStatus']);
        Route::delete('/requests/{id}', [RequestController::class, 'destroy']);
    });

    Route::get('/admin/accomplishments', [AccomplishmentController::class, 'index']);
    Route::post('/accomplishments', [AccomplishmentController::class, 'store']);
    Route::put('/accomplishments/{id}', [AccomplishmentController::class, 'update']);
    Route::delete('/accomplishments/{id}', [AccomplishmentController::class, 'destroy']);
    Route::post('/accomplishments/{id}/publish', [AccomplishmentController::class, 'publish']);
    Route::post('/accomplishments/{id}/unpublish', [AccomplishmentController::class, 'unpublish']);

    Route::post('/disclosures', [DisclosureController::class, 'store']);
    Route::put('/disclosures/{disclosure}', [DisclosureController::class, 'update']);
    Route::delete('/disclosures/{disclosure}', [DisclosureController::class, 'destroy']);

    Route::prefix('admin')->group(function () {
        Route::get('/monthly-reports', [MonthlyReportController::class, 'adminIndex']);
        Route::get('/monthly-reports/{id}', [MonthlyReportController::class, 'adminShow']);
        Route::get('/monthly-reports/{id}/download', [MonthlyReportController::class, 'adminDownload']);
        Route::post('/monthly-reports', [MonthlyReportController::class, 'store']);
        Route::post('/monthly-reports/{id}', [MonthlyReportController::class, 'update']);
        Route::delete('/monthly-reports/{id}', [MonthlyReportController::class, 'destroy']);
        Route::get('/monthly-reports-filters', [MonthlyReportController::class, 'adminFilters']);
        Route::get('/monthly-reports-statistics', [MonthlyReportController::class, 'adminStatistics']);
    });

    Route::prefix('admin')->group(function () {
    Route::prefix('kkid-profiles')->group(function () {
        // PUT THE EXPORT ROUTE FIRST (before any {id} routes)
        Route::post('/export', [KKIDProfileController::class, 'export']);
        
        // Then the other routes
        Route::get('/', [KKIDProfileController::class, 'index']);
        Route::post('/', [KKIDProfileController::class, 'store']);
        Route::get('/{id}', [KKIDProfileController::class, 'show']);
        Route::post('/{id}', [KKIDProfileController::class, 'update']);
        Route::delete('/{id}', [KKIDProfileController::class, 'destroy']);
        Route::patch('/{id}/status', [KKIDProfileController::class, 'updateStatus']);
        Route::get('/{id}/generate-id', [KKIDProfileController::class, 'generateID']);
        });
    });

    Route::prefix('admin/printing')->group(function () {
        Route::get('/', [FilePrintingController::class, 'index']);
        Route::get('/{id}', [FilePrintingController::class, 'show']);
        Route::get('/{id}/download/{filename}', [FilePrintingController::class, 'downloadFile']);
        Route::get('/{id}/file/{filename}/url', [FilePrintingController::class, 'getFileUrl']);
        Route::get('/debug/file-storage', [FilePrintingController::class, 'debugFileStorage']);
        Route::patch('/{id}/status', [FilePrintingController::class, 'updateStatus']);
        Route::delete('/{id}', [FilePrintingController::class, 'destroy']);
    });

    Route::get('/feedback', [FeedbackController::class, 'index']);
    Route::get('/feedback/stats', [FeedbackController::class, 'stats']);
});