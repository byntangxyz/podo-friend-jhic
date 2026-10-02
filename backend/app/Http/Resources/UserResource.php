<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
            'preference' => new UserPreferenceResource($this->whenLoaded('preference')),
            'gamification_stat' => new GamificationStatResource($this->whenLoaded('gamificationStat')),
            'daily_surveys' => DailySurveyResource::collection($this->whenLoaded('dailySurveys')),
            'pomodoro_sessions' => PomodoroSessionResource::collection($this->whenLoaded('pomodoroSessions')),
            'chat_histories' => ChatHistoryResource::collection($this->whenLoaded('chatHistories')),
        ];
    }
}
