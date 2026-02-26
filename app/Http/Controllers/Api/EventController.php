<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller; // IMPORTANTE
use App\Models\Event;
use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class EventController extends Controller
{
    /**
     * Muestra la lista de eventos próximos (Usando tu VISTA SQL)
     */
    public function index()
    {
        // Consultamos directamente la vista 'upcoming_events' de tu DB
        $eventos = DB::table('upcoming_events')->get();
        return response()->json($eventos);
    }

    /**
     * Almacena un nuevo evento (Dashboard del Gestor)
     */
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:200',
            'content' => 'required|string',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'location_id' => 'nullable|exists:locations,id',
            'price' => 'nullable|numeric',
        ]);

        try {
            return DB::transaction(function () use ($request) {
                // 1. Crear el Post (El contenedor cultural)
                $post = Post::create([
                    'user_id' => auth()->id(),
                    'content_type_id' => 2, // ID 2 = EVENTOS
                    'title' => $request->title,
                    'slug' => Str::slug($request->title) . '-' . time(),
                    'content' => $request->content,
                    'status' => 'published',
                    'published_at' => now(),
                ]);

                // 2. Crear el Evento vinculado al Post creado
                $event = Event::create([
                    'post_id' => $post->id,
                    'organizer_id' => auth()->id(),
                    'location_id' => $request->location_id,
                    'start_date' => $request->start_date,
                    'end_date' => $request->end_date,
                    'price' => $request->price ?? 0.00,
                    'event_type' => ($request->price > 0) ? 'paid' : 'free',
                    'event_status' => 'scheduled',
                    'available_slots' => $request->max_capacity,
                    'max_capacity' => $request->max_capacity,
                ]);

                return response()->json([
                    'message' => '¡Evento y Post creados exitosamente!',
                    'data' => $event->load('post')
                ], 210);
            });
        } catch (\Exception $e) {
            return response()->json(['error' => 'Error al procesar el evento: ' . $e->getMessage()], 500);
        }
    }
}