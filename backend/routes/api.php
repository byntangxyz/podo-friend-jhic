<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ChatSessionController;
use App\Http\Controllers\GamificationController;
use App\Http\Controllers\PreferenceController;
use App\Http\Controllers\SessionController;
use App\Http\Controllers\SurveyController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Public Authentication Routes
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
});

// Authenticated Routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    Route::post('/auth/logout', [AuthController::class, 'logout']);

    // Pomodoro Sessions
    Route::prefix('sessions')->group(function () {
        Route::post('/', [SessionController::class, 'start']);
        Route::put('/{id}', [SessionController::class, 'complete']);
    });

    // Daily Surveys (Mood)
    Route::post('/surveys/mood', [SurveyController::class, 'store']);
    Route::get('/surveys/today', [SurveyController::class, 'showToday']);

    // AI Chat Sessions & Messages
    Route::post('/chat-sessions', [ChatSessionController::class, 'store']);
    Route::get('/chat-sessions', [ChatSessionController::class, 'index']);
    Route::get('/chat-sessions/{session_id}', [ChatSessionController::class, 'show']);
    Route::delete('/chat-sessions/{session_id}', [ChatSessionController::class, 'destroy']);
    Route::post('/chat-sessions/{session_id}/messages', [ChatSessionController::class, 'storeMessage']);
    Route::get('/chat-sessions/{session_id}/messages', [ChatSessionController::class, 'showMessages']);

    // Data Retrieval (Gamification & Preferences)
    Route::get('/gamification/stats', [GamificationController::class, 'show']);
    Route::get('/user/preferences', [PreferenceController::class, 'show']);
    Route::put('/user/preferences', [PreferenceController::class, 'update']);
});
