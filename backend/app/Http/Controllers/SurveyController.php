<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreMoodRequest;
use App\Http\Resources\DailySurveyResource;
use App\Models\DailySurvey;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SurveyController extends Controller
{
    /**
     * Store or update today's mood check-in.
     */
    public function store(StoreMoodRequest $request): JsonResponse
    {
        $user = $request->user();
        $survey = DailySurvey::where('user_id', $user->id)
            ->whereDate('created_at', Carbon::today())
            ->first();

        if ($survey) {
            $survey->update([
                'mood' => $request->validated('mood'),
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Mood updated successfully',
                'data' => new DailySurveyResource($survey),
            ], 200);
        }

        $survey = DailySurvey::create([
            'user_id' => $user->id,
            'mood' => $request->validated('mood'),
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Mood recorded successfully',
            'data' => new DailySurveyResource($survey),
        ], 201);
    }

    /**
     * Get the latest mood check-in for today.
     */
    public function showToday(Request $request): JsonResponse
    {
        $survey = DailySurvey::where('user_id', $request->user()->id)
            ->whereDate('created_at', Carbon::today())
            ->first();

        return response()->json([
            'status' => 'success',
            'message' => $survey ? 'Today\'s mood retrieved successfully' : 'No mood recorded for today',
            'data' => $survey ? new DailySurveyResource($survey) : null,
        ], 200);
    }
}
