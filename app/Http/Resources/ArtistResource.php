<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ArtistResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'username' => $this->username,
            'bio' => $this->bio,
            'city' => $this->city,
            'is_verified' => (bool) $this->is_verified,
            
            // Formateo seguro de imágenes para Frontend
            'profile_picture' => $this->profile_picture 
                ? (str_starts_with($this->profile_picture, 'http') ? $this->profile_picture : url('storage/' . $this->profile_picture)) 
                : null,
                
            'cover_picture' => $this->cover_picture 
                ? (str_starts_with($this->cover_picture, 'http') ? $this->cover_picture : url('storage/' . $this->cover_picture)) 
                : null,
            
            'statistics' => [
                'published_posts' => $this->posts_count ?? 0,
            ]
        ];
    }
}