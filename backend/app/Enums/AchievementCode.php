<?php

namespace App\Enums;

class AchievementCode
{
    public const FIRST_SESSION = 'FIRST_SESSION';
    public const FIRST_60_MIN = 'FIRST_60_MIN';
    public const STREAK_2_DAYS = 'STREAK_2_DAYS';
    public const STREAK_3_DAYS = 'STREAK_3_DAYS';
    public const STREAK_7_DAYS = 'STREAK_7_DAYS';

    /**
     * All supported achievement codes.
     *
     * @return list<string>
     */
    public static function all(): array
    {
        return [
            self::FIRST_SESSION,
            self::FIRST_60_MIN,
            self::STREAK_2_DAYS,
            self::STREAK_3_DAYS,
            self::STREAK_7_DAYS,
        ];
    }
}
