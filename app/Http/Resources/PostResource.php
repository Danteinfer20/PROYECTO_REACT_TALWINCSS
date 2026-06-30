<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\DB;

class PostResource extends JsonResource
{
    /**
     * 🔥 FILTRO DE IDIOMA CORE (Arquitectura SRP)
     * Extrae de forma segura el texto correcto del objeto JSONB.
     * Si no encuentra el idioma solicitado o está vacío, usa el español como respaldo.
     */
    private function getLocalizedField(Request $request, $field)
    {
        // 1. Detectamos el idioma desde el encabezado de React (Por defecto 'es')
        $locale = $request->header('X-Localization', 'es');
        
        // 2. Si el campo está completamente vacío en la base de datos, retornamos un texto vacío
        if (empty($field)) return '';

        // 3. Decodificamos el JSONB. Si llega como string lo convierte a array, si ya es array lo usa directamente
        $decoded = is_string($field) ? json_decode($field, true) : $field;

        // 4. Salvavidas por si el formato no es un JSON válido
        if (json_last_error() !== JSON_ERROR_NONE || !is_array($decoded)) {
            return (string) $field; 
        }

        // 5. Extraemos el valor de la gaveta del idioma solicitado
        $value = $decoded[$locale] ?? '';

        // 6. Si la gaveta solicitada existe pero está vacía (''), forzamos el respaldo al español
        if (trim($value) === '') {
            $value = $decoded['es'] ?? '';
        }

        return (string) $value;
    }

    public function toArray(Request $request): array
    {
        // 1. Inicialización de variables de usuario para la telemetría
        $user = auth('sanctum')->user();
        $isSaved = false;
        $hasReacted = false;

        // 2. Bloque de telemetría polimórfica: Verificación de interacciones en base de datos
        if ($user) {
            $isSaved = DB::table('saved_items')
                ->where('savable_type', 'App\\Models\\Post')
                ->where('savable_id', $this->id)
                ->where('user_id', $user->id)
                ->exists();

            $hasReacted = DB::table('reactions')
                ->where('reactable_type', 'App\\Models\\Post')
                ->where('reactable_id', $this->id)
                ->where('user_id', $user->id)
                ->exists();
        }

        return [
            'id'           => $this->id,
            
            // ✅ FILTRADO ATÓMICO: Extracción limpia de textos bilingües de la obra
            'title'        => $this->getLocalizedField($request, $this->title),
            'slug'         => $this->slug,
            'excerpt'      => $this->getLocalizedField($request, $this->excerpt),
            'content'      => $this->getLocalizedField($request, $this->content),
            
            'status'       => $this->status,
            'published_at' => $this->published_at ? $this->published_at->diffForHumans() : null,
            
            // Gestión nativa de imágenes
            'image'        => $this->postMedia->first()?->file_path ?? $this->image ?? null,

            'images'       => $this->whenLoaded('postMedia', function () {
                return $this->postMedia->sortBy('sort_order')->map(fn($m) => $m->file_path)->values();
            }, []),

            // Relación polimórfica de comentarios asociada a su respectivo Resource
            'comments'     => CommentResource::collection($this->whenLoaded('comments')),
            
            'author'       => [
                'name'     => $this->user?->name ?? 'Maestro Patojo',
                'username' => $this->user?->username ?? 'anonimo',
                'avatar'   => $this->user?->profile_picture
            ],
            
            'category'     => [
                'id'   => $this->category?->id ?? null,
                // ✅ FILTRADO ATÓMICO: Evita el colapso en el DOM al leer la taxonomía mutada
                'name' => $this->getLocalizedField($request, $this->category?->name ?? 'General')
            ],

            'stats'        => [
                'views'     => $this->view_count ?? 0,
                'shares'    => $this->share_count ?? 0,
                'reactions' => $this->reactions_count ?? 0
            ],

            'user_interaction' => [
                'is_saved'    => $isSaved,
                'has_reacted' => $hasReacted,
            ]
        ];
    }
}