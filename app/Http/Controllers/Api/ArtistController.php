<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ArtistController extends Controller
{
    /**
     * Listado unificado con Filtro de Privacidad Activo
     * Solo muestra usuarios activos que NO hayan marcado su perfil como privado.
     */
    public function index()
    {
        try {
            $artists = User::whereIn('user_type', ['artist', 'cultural_manager', 'educator', 'admin'])
                ->where('status', 'active')
                // 🔥 ESCUDO DE PRIVACIDAD: Exclusión matemática de perfiles privados
                ->whereNotExists(function ($query) {
                    $query->select(DB::raw(1))
                        ->from('user_settings')
                        ->whereRaw('user_settings.user_id = users.id')
                        ->where('public_profile', false);
                })
                ->select('id', 'name', 'username', 'bio', 'profile_picture', 'city', 'user_type')
                ->orderBy('created_at', 'desc')
                ->take(12)
                ->get();

            return response()->json([
                'status' => 'success',
                'data' => $artists
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Fallo en el listado: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Perfil público con Bloqueo de Acceso Denegado
     * Si el perfil es privado, arroja 404 para no confirmar la existencia del usuario (Standard de Privacidad).
     */
    public function show($username)
    {
        try {
            $artist = User::where('username', $username)
                ->whereIn('user_type', ['artist', 'cultural_manager', 'educator', 'admin'])
                ->where('status', 'active')
                // 🔥 FILTRO DE ACCESO: Si el registro de privacidad es 'false', la consulta falla.
                ->whereNotExists(function ($query) {
                    $query->select(DB::raw(1))
                        ->from('user_settings')
                        ->whereRaw('user_settings.user_id = users.id')
                        ->where('public_profile', false);
                })
                ->firstOrFail();

            return response()->json([
                'status' => 'success',
                'data' => $artist
            ], 200);

        } catch (\Exception $e) {
            // El error 404 es la mejor defensa: el atacante no sabe si el usuario no existe o es privado.
            return response()->json([
                'status' => 'error',
                'message' => 'Perfil no encontrado o restringido.'
            ], 404);
        }
    }
}