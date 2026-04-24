<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class VerifiedCreator
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        // 1. Verificación de Autenticación Básica
        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'Protocolo fallido: Usuario no autenticado.'
            ], 401);
        }

        // 2. Verificación de Curaduría (Aprobación del Admin)
        if (!$user->is_verified) {
            return response()->json([
                'status' => 'error',
                'message' => 'Acceso denegado: Tu expediente aún está en revisión por la Corte de Curaduría.'
            ], 403);
        }

        // 3. Verificación de Rango (Solo la élite creativa pasa)
        $allowedRoles = ['artist', 'cultural_manager', 'educator'];
        
        if (!in_array($user->user_type, $allowedRoles)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Violación de rango: Tu nivel de acceso no permite entrar a esta zona.'
            ], 403);
        }

        // Si el usuario pasa las tres pruebas de plomo, se abren las puertas
        return $next($request);
    }
}