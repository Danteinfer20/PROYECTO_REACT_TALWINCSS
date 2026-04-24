<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Http\Resources\UserResource;
use Illuminate\Http\Request;

class UserController extends Controller
{
    /**
     * 🔍 OBTENER PERFIL PÚBLICO DEL USUARIO
     * Busca por @username en lugar de ID para URLs más limpias (Ej: popayancultural.com/julian_admin)
     */
    public function show($username)
    {
        // Buscamos estrictamente por username y que la cuenta esté activa
        $user = User::where('username', $username)
                    ->where('status', 'active')
                    ->firstOrFail(); // Si no lo encuentra, lanza un error 404 automático

        // 🔥 En el futuro, si el usuario es educador, aquí cargaremos sus cursos/obras
        // $user->load(['statistics']); 

        return response()->json([
            'status' => 'success',
            'data'   => new UserResource($user)
        ], 200);
    }
}