<?php
namespace App\Http\Controllers;

use App\Models\Feedback;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class FeedbackController extends Controller
{
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'answers' => 'required|array',
            'comment' => 'nullable|string',
            'name' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $feedback = Feedback::create([
            'answers' => json_encode($request->answers),
            'comment' => $request->comment,
            'name' => $request->name,
            'email' => $request->email,
            'submitted_at' => now(),
        ]);

        return response()->json([
            'message' => 'Feedback submitted successfully',
            'data' => $feedback
        ], 201);
    }

    public function index(Request $request)
    {
        $feedback = Feedback::orderBy('created_at', 'desc')->get();
        
        $feedback = $feedback->map(function ($item) {
            $item->answers = json_decode($item->answers, true);
            $date = $item->submitted_at ?? $item->created_at;

            $item->submittedAt = $date ? $date->toIso8601String() : null;
            
            return $item;
        });

        return response()->json($feedback);
    }

    public function stats(Request $request)
    {
        $total = Feedback::count();
        $averageRatings = [];
        
        $feedback = Feedback::all();
        
        if ($feedback->isNotEmpty()) {
            $ratings = [1 => 0, 2 => 0, 3 => 0, 4 => 0];
            
            foreach ($feedback as $f) {
                $answers = json_decode($f->answers, true);
                foreach ($answers as $rating) {
                    $ratings[$rating]++;
                }
            }
            
            $averageRatings = $ratings;
        }

        return response()->json([
            'total' => $total,
            'distribution' => $averageRatings,
            'recent' => Feedback::orderBy('created_at', 'desc')->take(5)->get()
        ]);
    }
}