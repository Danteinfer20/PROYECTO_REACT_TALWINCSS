<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Post;
use App\Models\PostMedia;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class PostController extends Controller
{
    /**
     * Muestra el catálogo (Obras públicas + Borradores del usuario actual)
     */
    public function index(Request $request) 
    {
        try {
            $query = Post::with([
                'user:id,name,username,profile_picture,neighborhood,city', 
                'category', 
                'contentType', 
                'media'
            ]);

            // Mostrar obras publicadas OR los borradores del usuario autenticado
            $query->where(function($q) {
                // 1. Siempre mostrar las publicadas a todo el mundo
                $q->where('status', 'published');
                
                // 2. MAGIA: Leer el token de Sanctum aunque la ruta sea pública
                if (Auth::guard('sanctum')->check()) {
                    $q->orWhere('user_id', Auth::guard('sanctum')->id());
                }
            });

            if ($request->has('category_id')) {
                $query->where('category_id', $request->category_id);
            }

            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('title', 'ilike', '%' . $search . '%')
                      ->orWhere('content', 'ilike', '%' . $search . '%');
                });
            }

            // Nota: paginate(100) para asegurar que el Dashboard de React reciba todas las del usuario en 1 sola carga
            return response()->json($query->latest()->paginate(100), 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Error en servidor: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Publicar o guardar como borrador una nueva obra
     */
    public function store(Request $request)
    {
        $request->validate([
            'title'           => 'required|string|max:200',
            'content'         => 'required|string',
            'category_id'     => 'required|exists:categories,id',
            'content_type_id' => 'required|exists:content_types,id',
            'status'          => 'required|in:published,draft',
            'image'           => 'required|image|mimes:jpeg,png,jpg,webp|max:5120', 
        ]);

        try {
            return DB::transaction(function () use ($request) {
                
                $post = Post::create([
                    'user_id'         => Auth::id(),
                    'category_id'     => $request->category_id,
                    'content_type_id' => $request->content_type_id,
                    'title'           => $request->title,
                    'slug'            => Str::slug($request->title) . '-' . Str::random(5),
                    'content'         => $request->content,
                    'status'          => $request->status, 
                    'published_at'    => $request->status === 'published' ? now() : null,
                ]);

                if ($request->hasFile('image')) {
                    $file = $request->file('image');
                    $path = $file->store('posts', 'public');

                    PostMedia::create([
                        'post_id'   => $post->id,
                        'file_type' => 'image',
                        'file_path' => $path,
                        'file_name' => $file->getClientOriginalName(),
                        'file_size' => $file->getSize(),
                        'is_cover'  => true,
                    ]);
                }

                return response()->json([
                    'status'  => 'success',
                    'message' => $request->status === 'published' ? '¡Obra lanzada con éxito!' : 'Borrador guardado.',
                    'data'    => $post->load('media')
                ], 201);
            });

        } catch (\Exception $e) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Error al procesar: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Actualizar una obra existente (Textos e Imagen)
     */
    public function update(Request $request, $id)
    {
        // Solo permite editar si el usuario autenticado es el dueño de la obra
        $post = Post::where('user_id', Auth::id())->findOrFail($id);

        $request->validate([
            'title'       => 'required|string|max:200',
            'content'     => 'required|string',
            'category_id' => 'required|exists:categories,id',
            'status'      => 'required|in:published,draft',
            'image'       => 'nullable|image|mimes:jpeg,png,jpg,webp|max:5120', // Es opcional al editar
        ]);

        try {
            return DB::transaction(function () use ($request, $post) {
                
                // Actualizamos los textos
                $post->update([
                    'title'       => $request->title,
                    'content'     => $request->content,
                    'category_id' => $request->category_id,
                    'status'      => $request->status,
                    // Si se publica por primera vez, guarda la fecha
                    'published_at'=> ($request->status === 'published' && !$post->published_at) ? now() : $post->published_at,
                ]);

                // Si mandó una foto nueva, reemplazamos la anterior
                if ($request->hasFile('image')) {
                    
                    // 1. Borrar la imagen vieja del disco duro
                    $oldMedia = PostMedia::where('post_id', $post->id)->first();
                    if ($oldMedia && Storage::disk('public')->exists($oldMedia->file_path)) {
                        Storage::disk('public')->delete($oldMedia->file_path);
                    }

                    // 2. Subir la nueva imagen
                    $file = $request->file('image');
                    $path = $file->store('posts', 'public');

                    // 3. Actualizar la base de datos
                    PostMedia::updateOrCreate(
                        ['post_id' => $post->id],
                        [
                            'file_type' => 'image',
                            'file_path' => $path,
                            'file_name' => $file->getClientOriginalName(),
                            'file_size' => $file->getSize(),
                            'is_cover'  => true,
                        ]
                    );
                }

                return response()->json([
                    'status'  => 'success',
                    'message' => 'Obra actualizada correctamente.',
                    'data'    => $post->load('media')
                ], 200);
            });

        } catch (\Exception $e) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Error al actualizar: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Elimina obra y limpia archivos del servidor físicamente.
     */
    public function destroy($id)
    {
        try {
            $post = Post::where('user_id', Auth::id())->findOrFail($id);
            $media = PostMedia::where('post_id', $id)->get();
            
            foreach ($media as $item) {
                if (Storage::disk('public')->exists($item->file_path)) {
                    Storage::disk('public')->delete($item->file_path);
                }
            }

            $post->delete(); 
            return response()->json(['message' => 'Obra eliminada correctamente'], 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'No autorizado o no encontrado'], 403);
        }
    }
}