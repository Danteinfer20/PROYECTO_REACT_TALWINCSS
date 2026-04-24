<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Post;
use Illuminate\Support\Facades\Auth;

class ReactionController extends Controller
{
    /**
     * Alternar Reacción (Toggle Polimórfico)
     */
    public function toggle(Request $request)
    {
        // 1. Validación escalable (Aceptamos post_id para las Obras, pero lo dejamos listo para otros tipos)
        $request->validate([
            'id' => 'required_without:post_id|integer',
            'post_id' => 'required_without:id|integer|exists:posts,id',
            'type' => 'nullable|string|in:post,event,product', 
            'reaction_type' => 'nullable|string|in:like,love,inspire,interest'
        ]);

        $user = Auth::user();
        
        // Estética Neo-Tradición: Nuestra reacción por defecto es "Inspirar"
        $reactionType = $request->reaction_type ?? 'inspire'; 

        // 2. Identificar el Modelo Polimórfico
        if ($request->has('post_id')) {
            $item = Post::findOrFail($request->post_id);
        } else {
            // Lógica preparada para el futuro (Eventos o Tienda)
            if ($request->type === 'event') {
                $item = \App\Models\Event::findOrFail($request->id);
            } elseif ($request->type === 'product') {
                $item = \App\Models\Product::findOrFail($request->id);
            } else {
                $item = Post::findOrFail($request->id);
            }
        }

        // 3. Verificamos si el usuario ya "Inspiró" esta obra
        $reaction = $item->reactions()
            ->where('user_id', $user->id)
            ->where('reaction_type', $reactionType)
            ->first();

        if ($reaction) {
            // Retirar inspiración
            $reaction->delete();
            return response()->json([
                'status' => 'removed',
                'message' => 'Inspiración retirada.'
            ], 200);
        } else {
            // Dar inspiración
            $item->reactions()->create([
                'user_id' => $user->id,
                'reaction_type' => $reactionType
            ]);
            
            return response()->json([
                'status' => 'added',
                'message' => '¡Has inspirado a este Maestro Artesano!'
            ], 201);
        }
    }
}