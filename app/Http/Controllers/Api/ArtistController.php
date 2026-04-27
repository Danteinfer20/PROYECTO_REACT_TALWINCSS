<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class ArtistController extends Controller
{
    /**
     * Listado unificado para Home y Directorio
     */
    public function index()
    {
        try {
            // 🔥 CAMBIO: En lugar de solo 'artist', permitimos los 3 tipos culturales
            $artists = User::whereIn('user_type', ['artist', 'cultural_manager', 'educator', 'admin'])
                ->where('status', 'active')
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
     * Perfil público (Sana el error 404 para gestores y educadores)
     */
    public function show($username)
    {
        try {
            // 🔥 CAMBIO: Quitamos la cadena de 'user_type' = 'artist'
            // Ahora busca a CUALQUIER usuario por su username mientras sea del ecosistema cultural
            $artist = User::where('username', $username)
                ->whereIn('user_type', ['artist', 'cultural_manager', 'educator', 'admin'])
                ->where('status', 'active')
                ->firstOrFail();

            // Mantenemos la estructura exacta del que te funciona
            return response()->json([
                'status' => 'success',
                'data' => $artist
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Perfil no encontrado.'
            ], 404);
        }
    }
}