<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SavedItem;
use App\Models\Post;
use Illuminate\Support\Facades\Auth;
use App\Http\Resources\SavedItemResource;
use App\Http\Requests\ToggleSavedItemRequest; // 🔥 Importamos el FormRequest

class SavedItemController extends Controller
{
    /**
     * Listar los favoritos del usuario autenticado
     */
    public function index()
    {
        // 🔥 CARGA SEGURA: 
        // Solo cargamos 'savable'. NO cargamos 'savable.media' aquí 
        // para evitar el Error 500 con modelos polimórficos que no tienen esa relación.
        $favoritos = SavedItem::where('user_id', Auth::id())
            ->with('savable') 
            ->latest()
            ->get();

        // 🛡️ Delegamos toda la transformación compleja al Resource
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
        
        // El Request ya validó que el post_id existe. Lo instanciamos.
        $post = Post::findOrFail($request->validated('post_id'));

        // Buscamos si ya existe el favorito a través de la relación polimórfica
        $item = $post->savedItems()->where('user_id', $user->id)->first();

        // Si existe, lo eliminamos (Quitar de favoritos)
        if ($item) {
            $item->delete();
            return response()->json([
                'status' => 'removed',
                'message' => 'Obra eliminada de tu archivo.'
            ], 200);
        }

        // Si no existe, lo creamos polimórficamente
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