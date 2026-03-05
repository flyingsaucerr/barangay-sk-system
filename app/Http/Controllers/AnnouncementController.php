<?php

namespace App\Http\Controllers;

use App\Models\Announcement;
use App\Models\Tag;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class AnnouncementController extends Controller
{
    public function index()
    {
        try {
            $announcements = Announcement::with('tags', 'user')->latest()->get();
            
            // Debug: Log the image paths from database
            foreach ($announcements as $announcement) {
                if ($announcement->image) {
                    Log::debug('Announcement image path from DB', [
                        'id' => $announcement->id,
                        'title' => $announcement->title,
                        'image_path' => $announcement->image,
                        'full_storage_path' => storage_path('app/public/' . $announcement->image),
                        'full_public_path' => public_path('storage/' . $announcement->image),
                        'file_exists_in_storage' => file_exists(storage_path('app/public/' . $announcement->image)),
                        'file_exists_in_public' => file_exists(public_path('storage/' . $announcement->image)),
                        'asset_url' => asset('storage/' . $announcement->image),
                        'storage_url' => Storage::url($announcement->image)
                    ]);
                }
            }
            
            return response()->json($announcements);
        } catch (\Exception $e) {
            Log::error('Error fetching announcements', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['error' => 'Failed to fetch announcements'], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            Log::info('=== ANNOUNCEMENT STORE DEBUG ===');
            Log::info('1. Request data:', [
                'all' => $request->all(),
                'files' => $request->allFiles(),
                'has_file' => $request->hasFile('image'),
                'content_type' => $request->header('Content-Type')
            ]);

            $validated = $request->validate([
                'title' => 'required|string|max:255',
                'content' => 'required|string',
                'full_content' => 'required|string',
                'priority' => 'required|in:low,medium,high',
                'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:5120',
            ]);

            Log::info('2. Validation passed', ['validated' => $validated]);

            // Initialize data array
            $data = [
                'title' => $validated['title'],
                'content' => $validated['content'],
                'full_content' => $validated['full_content'],
                'date' => now(),
                'author' => Auth::user()->name,
                'priority' => $validated['priority'],
                'user_id' => Auth::id(),
            ];

            // Handle image upload
            if ($request->hasFile('image')) {
                $file = $request->file('image');
                
                Log::info('3. Image file details:', [
                    'original_name' => $file->getClientOriginalName(),
                    'mime_type' => $file->getMimeType(),
                    'size' => $file->getSize(),
                    'extension' => $file->getClientOriginalExtension(),
                    'is_valid' => $file->isValid(),
                    'error' => $file->getError(),
                    'path_name' => $file->getPathname()
                ]);
                
                if ($file->isValid()) {
                    // Store the file
                    $path = $file->store('announcements', 'public');
                    
                    Log::info('4. File stored successfully', [
                        'path' => $path,
                        'full_storage_path' => storage_path('app/public/' . $path),
                        'full_public_path' => public_path('storage/' . $path),
                        'asset_url' => asset('storage/' . $path),
                        'storage_url' => Storage::url($path),
                        'file_exists_after_store' => file_exists(storage_path('app/public/' . $path))
                    ]);
                    
                    // IMPORTANT: Add the image path to the data array
                    $data['image'] = $path;
                    
                    Log::info('5. Image path added to data', ['data_image' => $data['image']]);
                } else {
                    Log::error('5. File is invalid', ['error' => $file->getError()]);
                }
            } else {
                Log::info('3. No image file in request');
            }

            Log::info('6. Creating announcement with data:', $data);

            $announcement = Announcement::create($data);
            
            Log::info('7. Announcement created', [
                'id' => $announcement->id,
                'image_path' => $announcement->image
            ]);

            // Handle tags if present
            if ($request->has('tags')) {
                Log::info('8. Processing tags', ['tags_raw' => $request->tags]);
                
                $tagsArray = json_decode($request->tags, true);
                Log::info('9. Decoded tags', ['tags_array' => $tagsArray]);
                
                if (is_array($tagsArray)) {
                    $tagIds = [];
                    foreach ($tagsArray as $tagName) {
                        $tag = Tag::firstOrCreate(['name' => trim($tagName)]);
                        $tagIds[] = $tag->id;
                        Log::info('10. Tag processed', ['tag_name' => $tagName, 'tag_id' => $tag->id]);
                    }
                    $announcement->tags()->sync($tagIds);
                    Log::info('11. Tags synced', ['tag_ids' => $tagIds]);
                }
            }

            // Final verification
            if ($announcement->image) {
                Log::info('12. Final image verification', [
                    'image_path' => $announcement->image,
                    'file_exists_in_storage' => file_exists(storage_path('app/public/' . $announcement->image)),
                    'file_exists_in_public' => file_exists(public_path('storage/' . $announcement->image)),
                    'public_url' => asset('storage/' . $announcement->image),
                    'storage_url' => Storage::url($announcement->image)
                ]);
            } else {
                Log::warning('12. No image path in announcement');
            }

            Log::info('=== END ANNOUNCEMENT STORE DEBUG ===');

            return response()->json($announcement->load('tags', 'user'), 201);

        } catch (\Exception $e) {
            Log::error('=== ANNOUNCEMENT STORE ERROR ===');
            Log::error('Error message: ' . $e->getMessage());
            Log::error('Error trace: ' . $e->getTraceAsString());
            Log::error('Error line: ' . $e->getLine());
            Log::error('Error file: ' . $e->getFile());
            
            return response()->json([
                'message' => 'Failed to create announcement',
                'error' => $e->getMessage(),
                'line' => $e->getLine(),
                'file' => $e->getFile()
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $announcement = Announcement::with('tags', 'user')->findOrFail($id);
            
            if ($announcement->image) {
                Log::debug('Show announcement image details', [
                    'id' => $id,
                    'image_path' => $announcement->image,
                    'file_exists' => file_exists(storage_path('app/public/' . $announcement->image)),
                    'public_url' => asset('storage/' . $announcement->image)
                ]);
            }
            
            return response()->json($announcement);
        } catch (\Exception $e) {
            Log::error('Error showing announcement', [
                'id' => $id,
                'message' => $e->getMessage()
            ]);
            return response()->json(['error' => 'Announcement not found'], 404);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            Log::info('=== ANNOUNCEMENT UPDATE DEBUG ===', ['id' => $id]);
            
            $announcement = Announcement::findOrFail($id);
            
            Log::info('1. Existing announcement', [
                'id' => $announcement->id,
                'old_image' => $announcement->image
            ]);

            $validated = $request->validate([
                'title' => 'required|string|max:255',
                'content' => 'required|string',
                'full_content' => 'required|string',
                'priority' => 'required|in:low,medium,high',
                'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:5120',
            ]);

            $data = [
                'title' => $validated['title'],
                'content' => $validated['content'],
                'full_content' => $validated['full_content'],
                'priority' => $validated['priority'],
            ];

            // Handle image upload
            if ($request->hasFile('image')) {
                $file = $request->file('image');
                
                Log::info('2. New image file details:', [
                    'original_name' => $file->getClientOriginalName(),
                    'mime_type' => $file->getMimeType(),
                    'size' => $file->getSize(),
                    'is_valid' => $file->isValid()
                ]);
                
                if ($file->isValid()) {
                    // Delete old image
                    if ($announcement->image) {
                        $oldPath = $announcement->image;
                        Log::info('3. Deleting old image', ['old_path' => $oldPath]);
                        
                        $deleted = Storage::disk('public')->delete($oldPath);
                        Log::info('4. Old image deleted', ['success' => $deleted]);
                    }
                    
                    $path = $file->store('announcements', 'public');
                    Log::info('5. New image stored', ['path' => $path]);
                    
                    // IMPORTANT: Add the image path to the data array
                    $data['image'] = $path;
                }
            }

            $announcement->update($data);
            Log::info('6. Announcement updated', ['new_image' => $announcement->image]);

            // Handle tags if present
            if ($request->has('tags')) {
                Log::info('7. Processing tags', ['tags_raw' => $request->tags]);
                
                $tagsArray = json_decode($request->tags, true);
                if (is_array($tagsArray)) {
                    $tagIds = [];
                    foreach ($tagsArray as $tagName) {
                        $tag = Tag::firstOrCreate(['name' => trim($tagName)]);
                        $tagIds[] = $tag->id;
                    }
                    $announcement->tags()->sync($tagIds);
                    Log::info('8. Tags synced', ['tag_ids' => $tagIds]);
                }
            }

            // Final verification
            if ($announcement->image) {
                Log::info('9. Final image verification', [
                    'image_path' => $announcement->image,
                    'file_exists' => file_exists(storage_path('app/public/' . $announcement->image)),
                    'public_url' => asset('storage/' . $announcement->image)
                ]);
            }

            Log::info('=== END ANNOUNCEMENT UPDATE DEBUG ===');

            return response()->json($announcement->load('tags', 'user'));

        } catch (\Exception $e) {
            Log::error('=== ANNOUNCEMENT UPDATE ERROR ===');
            Log::error('Error: ' . $e->getMessage());
            Log::error('Trace: ' . $e->getTraceAsString());
            
            return response()->json([
                'message' => 'Failed to update announcement',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            Log::info('Deleting announcement', ['id' => $id]);
            
            $announcement = Announcement::findOrFail($id);
            
            if ($announcement->image) {
                Log::info('Deleting image', ['path' => $announcement->image]);
                Storage::disk('public')->delete($announcement->image);
            }
            
            $announcement->delete();
            
            Log::info('Announcement deleted successfully', ['id' => $id]);
            
            return response()->json(['message' => 'Announcement deleted successfully']);

        } catch (\Exception $e) {
            Log::error('Error deleting announcement', [
                'id' => $id,
                'message' => $e->getMessage()
            ]);
            
            return response()->json([
                'message' => 'Failed to delete announcement',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Add a debug endpoint to check file existence
    public function debugImage($id)
    {
        try {
            $announcement = Announcement::findOrFail($id);
            
            if (!$announcement->image) {
                return response()->json(['message' => 'No image for this announcement'], 404);
            }
            
            $storagePath = storage_path('app/public/' . $announcement->image);
            $publicPath = public_path('storage/' . $announcement->image);
            $assetUrl = asset('storage/' . $announcement->image);
            $storageUrl = Storage::url($announcement->image);
            
            $debug = [
                'announcement_id' => $announcement->id,
                'title' => $announcement->title,
                'image_path' => $announcement->image,
                'storage_path' => $storagePath,
                'public_path' => $publicPath,
                'asset_url' => $assetUrl,
                'storage_url' => $storageUrl,
                'file_exists_in_storage' => file_exists($storagePath),
                'file_exists_in_public' => file_exists($publicPath),
                'storage_permissions' => file_exists($storagePath) ? substr(sprintf('%o', fileperms($storagePath)), -4) : null,
                'public_permissions' => file_exists($publicPath) ? substr(sprintf('%o', fileperms($publicPath)), -4) : null,
                'storage_link_exists' => file_exists(public_path('storage')),
                'storage_link_target' => is_link(public_path('storage')) ? readlink(public_path('storage')) : 'Not a symlink'
            ];
            
            return response()->json($debug);
            
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}