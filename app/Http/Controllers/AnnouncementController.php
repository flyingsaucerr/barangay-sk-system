<?php

namespace App\Http\Controllers;

use App\Models\Announcement;
use App\Models\Tag;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class AnnouncementController extends Controller
{
    public function index()
    {
        $announcements = Announcement::with('tags', 'user')->latest()->get();
        return response()->json($announcements);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'full_content' => 'required|string',
            'priority' => 'required|in:low,medium,high',
            'tags' => 'array',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048', // Add image validation
        ]);

        $data = [
            'title' => $request->title,
            'content' => $request->content,
            'full_content' => $request->full_content,
            'date' => now(),
            'author' => Auth::user()->name,
            'priority' => $request->priority,
            'user_id' => Auth::id(),
        ];

        // Handle image upload
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('announcements', 'public');
            $data['image'] = $imagePath;
        }

        $announcement = Announcement::create($data);

        if ($request->has('tags')) {
            $tagIds = [];
            foreach ($request->tags as $tagName) {
                $tag = Tag::firstOrCreate(['name' => $tagName]);
                $tagIds[] = $tag->id;
            }
            $announcement->tags()->sync($tagIds);
        }

        return response()->json($announcement->load('tags', 'user'), 201);
    }

    public function show($id)
    {
        $announcement = Announcement::with('tags', 'user')->findOrFail($id);
        return response()->json($announcement);
    }

    public function update(Request $request, $id)
    {
        $announcement = Announcement::findOrFail($id);

        $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'full_content' => 'required|string',
            'priority' => 'required|in:low,medium,high',
            'tags' => 'array',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048', // Add image validation
        ]);

        $data = [
            'title' => $request->title,
            'content' => $request->content,
            'full_content' => $request->full_content,
            'priority' => $request->priority,
        ];

        // Handle image upload
        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($announcement->image) {
                Storage::disk('public')->delete($announcement->image);
            }
            
            $imagePath = $request->file('image')->store('announcements', 'public');
            $data['image'] = $imagePath;
        }

        $announcement->update($data);

        if ($request->has('tags')) {
            $tagIds = [];
            foreach ($request->tags as $tagName) {
                $tag = Tag::firstOrCreate(['name' => $tagName]);
                $tagIds[] = $tag->id;
            }
            $announcement->tags()->sync($tagIds);
        }

        return response()->json($announcement->load('tags', 'user'));
    }

    public function destroy($id)
    {
        $announcement = Announcement::findOrFail($id);
        
        // Delete image file if exists
        if ($announcement->image) {
            Storage::disk('public')->delete($announcement->image);
        }
        
        $announcement->delete();

        return response()->json(['message' => 'Announcement deleted successfully']);
    }
}