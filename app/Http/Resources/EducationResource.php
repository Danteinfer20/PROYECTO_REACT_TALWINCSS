<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EducationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                  => $this->id,
            'title'               => $this->title,
            // Si estamos en la lista principal, enviamos el excerpt. Si es el detalle (show), enviamos el content completo.
            'excerpt'             => $this->excerpt,
            'content'             => $this->when(isset($this->is_detail), $this->content), 
            
            'metadata' => [
                'difficulty_level'    => $this->difficulty_level ?? 'beginner',
                'estimated_read_time' => $this->estimated_read_time ?? 5,
                'knowledge_area'      => $this->knowledge_area ?? 'Cultura General',
                'historical_period'   => $this->historical_period,
                'category_name'       => $this->category_name,
            ],
            
            'author' => [
                'name'   => $this->author_name,
                'avatar' => $this->author_avatar,
            ],
            
            'stats' => [
                'reactions' => (int) $this->reaction_count,
                'comments'  => (int) $this->comment_count,
            ],
        ];
    }
}