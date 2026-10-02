<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class GamificationStat extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'current_streak',
        'total_focus_time',
        'last_active_date',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'current_streak' => 'integer',
            'total_focus_time' => 'integer',
            'last_active_date' => 'datetime',
        ];
    }

    /**
     * Get the user that owns the gamification stats.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
