<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        RateLimiter::for('auth', function (Request $request) {
            return Limit::perMinute(10)
                ->by($request->input('email') ? (string) $request->input('email').'|'.$request->ip() : $request->ip())
                ->response(function (Request $request, array $headers) {
                    return response()->json([
                        'status' => 'error',
                        'message' => 'Terlalu banyak percobaan autentikasi. Silakan tunggu beberapa saat.',
                        'data' => null,
                    ], 429, $headers);
                });
        });

        RateLimiter::for('ai-chat', function (Request $request) {
            return Limit::perMinute(30)
                ->by($request->user()?->id ?: $request->ip())
                ->response(function (Request $request, array $headers) {
                    return response()->json([
                        'status' => 'error',
                        'message' => 'Terlalu banyak pesan terkirim. Silakan tunggu beberapa saat.',
                        'data' => null,
                    ], 429, $headers);
                });
        });

        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(60)
                ->by($request->user()?->id ?: $request->ip())
                ->response(function (Request $request, array $headers) {
                    return response()->json([
                        'status' => 'error',
                        'message' => 'Batas permintaan tercapai. Silakan coba lagi nanti.',
                        'data' => null,
                    ], 429, $headers);
                });
        });
    }
}
