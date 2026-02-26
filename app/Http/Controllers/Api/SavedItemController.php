<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SavedItem;
use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SavedItemController extends Controller
{
    /**
     * Listar los favoritos del usuario autenticado
     */
    public function index()
    {
        $favoritos = SavedItem::with(['post.media', 'post.user'])
            ->where('user_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $favoritos
        ]);
    }

    /**
     * Guardar o quitar de favoritos (Toggle)
     */
    public function toggle(Request $request)
    {
        $request->validate([
            'post_id' => 'required|exists:posts,id'
        ]);

        $userId = Auth::id();
        $postId = $request->post_id;

        // Buscamos si ya está guardado
        $item = SavedItem::where('user_id', $userId)
            ->where('post_id', $postId)
            ->first();

        if ($item) {
            $item->delete();
            return response()->json([
                'status' => 'removed',
                'message' => 'Obra eliminada de tus favoritos'
            ]);
        }

        // Si no existe, lo creamos
        SavedItem::create([
            'user_id' => $userId,
            'post_id' => $postId
        ]);

        return response()->json([
            'status' => 'added',
            'message' => '¡Obra guardada en tus favoritos!'
        ], 201);
    }
}