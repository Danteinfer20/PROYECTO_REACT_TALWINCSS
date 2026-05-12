<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Post;
use App\Http\Requests\StoreCommentRequest;
use App\Http\Resources\CommentResource;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB; // 🔥 Requerido para el Motor de Notificaciones

class CommentController extends Controller
{
    /**
     * Crear un nuevo comentario (Polimórfico con Sistema Nervioso)
     */
    public function store(StoreCommentRequest $request)
    {
        // 1. La validación ya fue ejecutada por el FormRequest
        $data = $request->validated();
        $user = Auth::user();

        // 2. Buscamos la Obra (Post) a la que pertenece el comentario
        $post = Post::findOrFail($data['post_id']);

        // 3. Magia Polimórfica: Usamos la relación para crear el registro.
        $comment = $post->comments()->create([
            'user_id' => $user->id,
            'content' => $data['content'],
            'status'  => 'visible' // Estado por defecto según la DB
        ]);

        // 🔥 4. MOTOR NERVIOSO: Notificaciones con validación de privacidad
        // Evitamos enviar notificaciones si el usuario comenta su propia obra
        if ($post->user_id !== $user->id) {
            
            // Verificamos el interruptor de privacidad del autor
            $settings = DB::table('user_settings')
                ->where('user_id', $post->user_id)
                ->first();
                
            // Si no hay configuración previa, el default de la DB es true
            $wantsNotification = $settings ? (bool) $settings->comments_notify : true;

            if ($wantsNotification) {
                // Inyectamos la alerta directamente en PostgreSQL
                DB::table('notifications')->insert([
                    'user_id'    => $post->user_id,
                    'type'       => 'comment',
                    'title'      => 'Nuevo comentario en tu obra',
                    'message'    => "{$user->name} ha comentado en: {$post->title}",
                    'action_url' => "/posts/{$post->slug}", // Redirección exacta al post
                    'is_read'    => false,
                    'created_at' => now(),
                    'read_at'    => null
                ]);
            }
        }

        // 5. Cargamos la relación del usuario para que el Resource no falle
        $comment->load('user');

        // 6. Retornamos la respuesta estilizada
        return response()->json([
            'status'  => 'success',
            'message' => 'Tu voz ha sido escuchada en esta obra.',
            'data'    => new CommentResource($comment)
        ], 201);
    }
}