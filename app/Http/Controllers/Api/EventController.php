<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\Post;
use App\Models\Location;
use App\Models\ContentType;
use App\Models\Category;
use App\Models\PostMedia;
use App\Models\EventAttendance;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use App\Traits\UploadsToCloudinary;
use App\Http\Resources\EventResource;
use App\Http\Requests\StoreEventRequest;
use App\Http\Requests\UpdateEventRequest;

class EventController extends Controller
{
    use UploadsToCloudinary;

    /**
     * 🌐 Vista Pública: Cartelera general de Popayán.
     */
    public function index(Request $request)
    {
        try {
            $events = Event::with(['post.category', 'post.postMedia', 'location', 'organizer'])
                ->where('event_status', 'scheduled')
                ->where('start_date', '>=', now())
                ->whereHas('post', function ($query) {
                    $query->where('status', 'published'); 
                })
                ->orderBy('start_date', 'asc')
                ->paginate(12);

            return EventResource::collection($events);
            
        } catch (\Exception $e) {
            Log::error('Error cargando eventos: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Error recuperando la agenda cultural.',
                'debug' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * 🔥 AGENDA CULTURAL PRIVADA: Resuelve el Catálogo Vacío en React.
     */
    public function myEvents(Request $request): JsonResponse
    {
        $user = $request->user();

        $eventos = Event::with(['post.category', 'post.postMedia', 'location'])
                    ->where('organizer_id', $user->id)
                    ->latest()
                    ->get();

        return response()->json([
            'status' => 'success',
            'message' => 'Agenda cultural recuperada con éxito.',
            'data' => EventResource::collection($eventos)
        ]);
    }

    public function show($id)
    {
        $event = Event::with([
            'post.category', 'post.postMedia', 'location', 'organizer', 'post.comments.user'
        ])->findOrFail($id);

        return new EventResource($event);
    }

    public function store(StoreEventRequest $request)
    {
        $event = DB::transaction(function () use ($request) {
            $user = $request->user();

            $contentType = ContentType::firstOrCreate(
                ['name' => 'Evento Cultural'],
                ['allows_events' => true]
            );
            
            $category = Category::where('category_type', 'event')->first();

            // 🔥 Convertir campos a JSON (como en PostController)
            $titleJson = json_encode(['es' => $request->title], JSON_UNESCAPED_UNICODE);
            $excerptText = Str::limit(strip_tags($request->content), 150);
            $excerptJson = json_encode(['es' => $excerptText], JSON_UNESCAPED_UNICODE);
            $contentJson = json_encode(['es' => $request->content], JSON_UNESCAPED_UNICODE);

            // 1. Crear Post
            $post = Post::create([
                'user_id'         => $user->id,
                'category_id'     => $category ? $category->id : null,
                'content_type_id' => $contentType->id,
                'title'           => $titleJson,
                'slug'            => Str::slug($request->title) . '-' . uniqid(),
                'excerpt'         => $excerptJson,
                'content'         => $contentJson,
                'status'          => 'published',
                'published_at'    => now(),
            ]);

            // 2. Crear Evento
            $event = Event::create([
                'post_id'              => $post->id,
                'location_id'          => $request->location_id,
                'custom_location_name' => $request->custom_location_name,
                'custom_address'       => $request->custom_address,
                'latitude'             => $request->latitude,
                'longitude'            => $request->longitude,
                'organizer_id'         => $user->id,
                'start_date'           => $request->start_date,
                'end_date'             => $request->end_date,
                'price'                => $request->price ?? 0,
                'max_capacity'         => $request->max_capacity ?? null,
                'available_slots'      => $request->max_capacity ?? null, 
                'requires_rsvp'        => $request->boolean('requires_rsvp'), 
                'event_type'           => $request->event_type,
                'event_status'         => 'scheduled',
            ]);

            // 3. Cloudinary
            if ($request->hasFile('image')) {
                $file = $request->file('image');
                $secureUrl = $this->uploadImageToCloud($file, 'popayan/events');

                PostMedia::create([
                    'post_id'    => $post->id,
                    'file_type'  => 'image',
                    'file_path'  => $secureUrl,
                    'file_name'  => 'cover_' . $post->slug,
                    'is_cover'   => true,
                    'sort_order' => 0
                ]);
            }

            return $event->load(['post.category', 'post.postMedia', 'location', 'organizer']);
        });

        return response()->json([
            'status'  => 'success',
            'message' => 'Evento forjado con éxito en la cartelera.',
            'data'    => new EventResource($event)
        ], 201);
    }

    public function update(UpdateEventRequest $request, $id)
    {
        $event = Event::where('organizer_id', auth()->id())->findOrFail($id);
        $post = $event->post;

        DB::transaction(function () use ($request, $event, $post) {
            $postData = [];

            // 🔥 Actualizar solo campos que vienen en la request (y convertirlos a JSON)
            if ($request->has('title')) {
                $postData['title'] = json_encode(['es' => $request->title], JSON_UNESCAPED_UNICODE);
            }

            if ($request->has('content')) {
                $excerptText = Str::limit(strip_tags($request->content), 150);
                $postData['excerpt'] = json_encode(['es' => $excerptText], JSON_UNESCAPED_UNICODE);
                $postData['content'] = json_encode(['es' => $request->content], JSON_UNESCAPED_UNICODE);
            }

            if (!empty($postData)) {
                $post->update($postData);
            }

            // Actualizar evento
            $event->update([
                'location_id'          => $request->location_id ?? $event->location_id,
                'custom_location_name' => $request->has('custom_location_name') ? $request->custom_location_name : $event->custom_location_name,
                'custom_address'       => $request->has('custom_address') ? $request->custom_address : $event->custom_address,
                'latitude'             => $request->has('latitude') ? $request->latitude : $event->latitude,
                'longitude'            => $request->has('longitude') ? $request->longitude : $event->longitude,
                'start_date'           => $request->start_date ?? $event->start_date,
                'end_date'             => $request->end_date ?? $event->end_date,
                'price'                => $request->price ?? $event->price,
                'max_capacity'         => $request->has('max_capacity') ? $request->max_capacity : $event->max_capacity,
                'requires_rsvp'        => $request->has('requires_rsvp') ? $request->boolean('requires_rsvp') : $event->requires_rsvp,
                'event_type'           => $request->event_type ?? $event->event_type,
            ]);

            if ($request->hasFile('image')) {
                $file = $request->file('image');
                $secureUrl = $this->uploadImageToCloud($file, 'popayan/events');
                $coverMedia = $post->postMedia()->where('is_cover', true)->first();

                if ($coverMedia) {
                    $coverMedia->update(['file_path' => $secureUrl]);
                } else {
                    PostMedia::create([
                        'post_id'    => $post->id,
                        'file_type'  => 'image',
                        'file_path'  => $secureUrl,
                        'file_name'  => 'cover_' . $post->slug,
                        'is_cover'   => true,
                        'sort_order' => 0
                    ]);
                }
            }
        });

        return response()->json([
            'status'  => 'success',
            'message' => 'Evento refinado con éxito.',
            'data'    => new EventResource($event->fresh(['post.category', 'post.postMedia', 'location', 'organizer']))
        ]);
    }

    public function destroy($id)
    {
        $event = Event::where('organizer_id', auth()->id())->findOrFail($id);
        $event->post()->delete();
        $event->delete();

        return response()->json([
            'status'  => 'success',
            'message' => 'Evento erradicado de la cartelera.'
        ]);
    }

    public function locations()
    {
        $locations = Location::select('id', 'name', 'address', 'neighborhood', 'location_type')
            ->orderBy('name', 'asc')
            ->get();

        return response()->json(['status' => 'success', 'locations' => $locations], 200);
    }

    /**
     * 🎫 Generar ticket de acceso (para eventos gratuitos o de pago con flujo P2P)
     * 🔥 AHORA VALIDA QUE EL EVENTO NO HAYA COMENZADO
     */
    public function attend(Request $request, $id)
    {
        $event = Event::findOrFail($id);
        $user = $request->user();

        // Validar que el evento no haya comenzado
        $now = now();
        if ($now > $event->start_date) {
            return response()->json([
                'status' => 'error',
                'message' => 'El evento ya comenzó o ha finalizado. No se pueden generar nuevos pases.'
            ], 403);
        }

        if ($event->available_slots <= 0 && $event->requires_rsvp) {
            return response()->json(['status' => 'error', 'message' => 'El evento ha alcanzado su aforo máximo (Sold Out).'], 400);
        }

        $existingTicket = EventAttendance::where('event_id', $event->id)->where('user_id', $user->id)->first();
        if ($existingTicket) {
            return response()->json(['status' => 'info', 'message' => 'Ya posees un registro.', 'data' => $existingTicket], 200);
        }

        $ticket = DB::transaction(function () use ($event, $user) {
            $status = $event->price > 0 ? 'interested' : 'confirmed';
            $qrString = 'POP-' . $event->id . 'USR-' . $user->id . '-' . strtoupper(Str::random(6));

            if($event->requires_rsvp) {
                $event->decrement('available_slots');
            }

            return EventAttendance::create([
                'event_id'    => $event->id,
                'user_id'     => $user->id,
                'status'      => $status,
                'guest_count' => 1,
                'qr_code'     => $qrString
            ]);
        });

        return response()->json(['status' => 'success', 'message' => 'Boleto digital generado.', 'data' => $ticket], 201);
    }
}