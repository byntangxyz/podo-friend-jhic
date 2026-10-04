<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserAchievementResource extends JsonResource
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
            'achievement_code' => $this->achievement_code,
            'unlocked_at' => $this->unlocked_at?->toISOString(),
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
