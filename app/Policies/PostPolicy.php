<?php

namespace App\Policies;

use App\Models\Post;
use App\Models\User;

class PostPolicy
{
    /**
     * Determina si el usuario puede crear obras.
     * Cualquier artesano logueado puede crear.
     */
    public function create(User $user): bool
    {
        return true; 
    }

    /**
     * Determina si el usuario puede actualizar la obra.
     * Solo si el ID del usuario coincide con el user_id del Post.
     */
    public function update(User $user, Post $post): bool
    {
        return $user->id === $post->user_id;
    }

    /**
     * Determina si el usuario puede eliminar la obra.
     * Solo el dueño tiene el permiso de borrar.
     */
    public function delete(User $user, Post $post): bool
    {
        return $user->id === $post->user_id;
    }

    // Los métodos viewAny y view no suelen necesitar Policy si tu catálogo es público.
    // Pero si quieres que solo logueados vean, puedes ponerlos en true.
}