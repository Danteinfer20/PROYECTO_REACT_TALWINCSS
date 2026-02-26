<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Post;
use App\Models\PostMedia;
use App\Models\Category;
use App\Models\ContentType;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class PostController extends Controller
{
    /**
     * Muestra el catálogo con información extendida del usuario.
     */
    public function index(Request $request) 
    {
        try {
            $query = Post::with([
                'user:id,name,username,profile_picture,neighborhood,city', 
                'category', 
                'contentType', 
                'media'
            ])->where('status', 'published');

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

            return response()->json($query->latest()->paginate(12), 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Error en servidor: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Publicar obra vinculando multimedia.
     */
    public function store(Request $request)
    {
        // 1. Validación estricta
        $request->validate([
            'title'           => 'required|string|max:200',
            'content'         => 'required|string',
            'category_id'     => 'required|exists:categories,id',
            'content_type_id' => 'required|exists:content_types,id',
            'image'           => 'required|image|mimes:jpeg,png,jpg,webp|max:5120', 
        ]);

        try {
            return DB::transaction(function () use ($request) {
                
                // 2. Crear el Post
                $post = Post::create([
                    'user_id'         => Auth::id(),
                    'category_id'     => $request->category_id,
                    'content_type_id' => $request->content_type_id,
                    'title'           => $request->title,
                    'slug'            => Str::slug($request->title) . '-' . Str::random(5),
                    'content'         => $request->content,
                    'status'          => 'published',
                    'published_at'    => now(),
                ]);

                // 3. Manejo de Archivo
                if ($request->hasFile('image')) {
                    $file = $request->file('image');
                    
                    // Guardar físicamente en storage/app/public/posts
                    $path = $file->store('posts', 'public');

                    // 4. Registrar en post_media con RUTA RELATIVA
                    PostMedia::create([
                        'post_id'   => $post->id,
                        'file_type' => 'image',
                        'file_path' => $path, // ✅ Guardamos 'posts/nombre.jpg'
                        'file_name' => $file->getClientOriginalName(),
                        'file_size' => $file->getSize(),
                        'is_cover'  => true,
                    ]);
                }

                return response()->json([
                    'status'  => 'success',
                    'message' => '¡Obra lanzada con éxito!',
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
     * Elimina obra y limpia archivos del servidor físicamente.
     */
    public function destroy($id)
    {
        try {
            $post = Post::where('user_id', Auth::id())->findOrFail($id);
            $media = PostMedia::where('post_id', $id)->get();
            
            foreach ($media as $item) {
                // Borrar archivo del disco public
                if (Storage::disk('public')->exists($item->file_path)) {
                    Storage::disk('public')->delete($item->file_path);
                }
            }

            $post->delete(); // Elimina post y por cascada sus registros en post_media
            return response()->json(['message' => 'Obra eliminada correctamente'], 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'No autorizado o no encontrado'], 403);
        }
    }
}