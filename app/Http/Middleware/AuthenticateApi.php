<?php

namespace App\Http\Middleware;

use Illuminate\Auth\Middleware\Authenticate as Middleware;
use Illuminate\Http\Request;

class AuthenticateApi extends Middleware
{
    protected function redirectTo(Request $request): ?string
    {
        // For API requests, return JSON response instead of redirect
        if ($request->expectsJson()) {
            abort(401, 'Unauthenticated.');
        }
        
        return route('login');
    }
}