<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class CheckUserStatus
{
    public function handle(Request $request, Closure $next): Response
    {
        // Si el usuario está autenticado y su estado NO es activo
        if (Auth::check() && Auth::user()->status !== 'active') {
            
            // Si es una petición API (React), enviamos error 403
            if ($request->expectsJson()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Tu cuenta ha sido suspendida. Contacta al administrador de Popayán Cultural.'
                ], 403);
            }

            // Si es web, cerramos sesión y redirigimos
            Auth::logout();
            return redirect()->route('login')->with('error', 'Cuenta suspendida.');
        }

        return $next($request);
    }
}