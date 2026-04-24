<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Post;
use App\Http\Requests\StoreCommentRequest;
use App\Http\Resources\CommentResource;
use Illuminate\Support\Facades\Auth;

class CommentController extends Controller
{
    /**
     * Crear un nuevo comentario (Polimórfico)
     */
    public function store(StoreCommentRequest $request)
    {
        // 1. La validación ya fue ejecutada por el FormRequest
        $data = $request->validated();
        $user = Auth::user();

        // 2. Buscamos la Obra (Post) a la que pertenece el comentario
        $post = Post::findOrFail($data['post_id']);

        // 3. Magia Polimórfica: Usamos la relación para crear el registro.
        // Eloquent inyectará automáticamente commentable_type = 'App\Models\Post'
        $comment = $post->comments()->create([
            'user_id' => $user->id,
            'content' => $data['content'],
            'status'  => 'visible' // Estado por defecto según la DB
        ]);

        // 4. Cargamos la relación del usuario para que el Resource no falle
        $comment->load('user');

        // 5. Retornamos la respuesta estilizada
        return response()->json([
            'status'  => 'success',
            'message' => 'Tu voz ha sido escuchada en esta obra.',
            'data'    => new CommentResource($comment)
        ], 201);
    }
}