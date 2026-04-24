<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AdminMiddleware
{
    /**
     * Maneja la petición entrante.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // 1. Verifica si el usuario está logueado y si su rol es exactamente 'admin'
        if (!auth()->check() || auth()->user()->user_type !== 'admin') {
            return response()->json([
                'status' => 'error',
                'message' => 'Acceso denegado. Nivel de acceso insuficiente.'
            ], 403); // 403 = Prohibido
        }

        // 2. Si es Admin, lo deja pasar al Controlador
        return $next($request);
    }
}