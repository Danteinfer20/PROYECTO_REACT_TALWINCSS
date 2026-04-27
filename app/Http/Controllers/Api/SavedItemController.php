<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SavedItem;
use App\Models\Post;
use Illuminate\Support\Facades\Auth;
use App\Http\Resources\SavedItemResource;
use App\Http\Requests\ToggleSavedItemRequest; 

class SavedItemController extends Controller
{
    /**
     * Listar los favoritos del usuario autenticado
     */
    public function index()
    {
        // 🔥 CARGA SEGURA RESTAURADA: 
        // Volvemos a la consulta original que NO tumba el servidor.
        $favoritos = SavedItem::where('user_id', Auth::id())
            ->with('savable') 
            ->latest()
            ->get();

        return response()->json([
            'status' => 'success',
            'data'   => SavedItemResource::collection($favoritos)
        ], 200);
    }

    /**
     * Guardar o quitar de favoritos (Toggle Polimórfico)
     */
    public function toggle(ToggleSavedItemRequest $request)
    {
        $user = Auth::user();
        
        $post = Post::findOrFail($request->validated('post_id'));

        $item = $post->savedItems()->where('user_id', $user->id)->first();

        if ($item) {
            $item->delete();
            return response()->json([
                'status' => 'removed',
                'message' => 'Obra eliminada de tu archivo.'
            ], 200);
        }

        $post->savedItems()->create([
            'user_id' => $user->id,
            'category' => 'favorites' 
        ]);

        return response()->json([
            'status' => 'added',
            'message' => '¡Obra añadida a tu colección privada!'
        ], 201);
    }
}