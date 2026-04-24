<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class ArtistController extends Controller
{
    /**
     * Extrae el listado de artistas para la página pública (Home y Directorio)
     */
    public function index()
    {
        try {
            // 🔥 ARQUITECTURA PRO: Filtramos estrictamente a los creadores activos
            $artists = User::where('user_type', 'artist')
                ->where('status', 'active')
                ->select('id', 'name', 'username', 'bio', 'profile_picture', 'city')
                ->orderBy('created_at', 'desc')
                ->take(8) // Límite de seguridad para el Home
                ->get();

            return response()->json([
                'status' => 'success',
                'data' => $artists
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Fallo en el núcleo público de artistas: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Muestra el perfil público de un artista específico
     */
    public function show($username)
    {
        try {
            $artist = User::where('username', $username)
                ->where('user_type', 'artist')
                ->where('status', 'active')
                ->firstOrFail();

            return response()->json([
                'status' => 'success',
                'data' => $artist
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Artista no encontrado o inactivo.'
            ], 404);
        }
    }
}