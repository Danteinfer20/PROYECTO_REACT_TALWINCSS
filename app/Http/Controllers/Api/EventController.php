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
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use App\Traits\UploadsToCloudinary; // 🔥 INYECTADO
use App\Http\Resources\EventResource;
use App\Http\Requests\StoreEventRequest;
use App\Http\Requests\UpdateEventRequest; // 🔥 INYECTADO

class EventController extends Controller
{
    use UploadsToCloudinary; // 🔥 ACTIVADO

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
            \Log::error('Error cargando eventos: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Error recuperando la agenda cultural.',
                'debug' => $e->getMessage()
            ], 500);
        }
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

            // 1. Crear Post
            $post = Post::create([
                'user_id'         => $user->id,
                'category_id'     => $category ? $category->id : null,
                'content_type_id' => $contentType->id,
                'title'           => $request->title,
                'slug'            => Str::slug($request->title) . '-' . uniqid(),
                'excerpt'         => Str::limit(strip_tags($request->content), 150),
                'content'         => $request->content,
                'status'          => 'published',
                'published_at'    => now(),
            ]);

            // 2. Crear Evento
            $event = Event::create([
                'post_id'         => $post->id,
                'location_id'     => $request->location_id,
                'organizer_id'    => $user->id,
                'start_date'      => $request->start_date,
                'end_date'        => $request->end_date,
                'price'           => $request->price ?? 0,
                'max_capacity'    => $request->max_capacity ?? null,
                'available_slots' => $request->max_capacity ?? null, 
                'requires_rsvp'   => $request->boolean('requires_rsvp'), 
                'event_type'      => $request->event_type,
                'event_status'    => 'scheduled',
            ]);

            // 3. 🔥 Cloudinary
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
            'message' => 'Evento forjado con éxito en la cartelera.',
            'data'    => new EventResource($event)
        ], 201);
    }

    public function update(UpdateEventRequest $request, $id)
    {
        $event = Event::where('organizer_id', auth()->id())->findOrFail($id);
        $post = $event->post;

        DB::transaction(function () use ($request, $event, $post) {
            // 1. Actualizar Post
            $post->update([
                'title'   => $request->title ?? $post->title,
                'excerpt' => $request->has('content') ? Str::limit(strip_tags($request->content), 150) : $post->excerpt,
                'content' => $request->content ?? $post->content,
            ]);

            // 2. Actualizar Evento
            // Cuidado con el cupo: Si cambian max_capacity, deberíamos recalcular available_slots (esto es un TODO lógico, por ahora sobreescribimos)
            $event->update([
                'location_id'   => $request->location_id ?? $event->location_id,
                'start_date'    => $request->start_date ?? $event->start_date,
                'end_date'      => $request->end_date ?? $event->end_date,
                'price'         => $request->price ?? $event->price,
                'max_capacity'  => $request->has('max_capacity') ? $request->max_capacity : $event->max_capacity,
                'requires_rsvp' => $request->has('requires_rsvp') ? $request->boolean('requires_rsvp') : $event->requires_rsvp,
                'event_type'    => $request->event_type ?? $event->event_type,
            ]);

            // 3. 🔥 Actualizar Imagen (Cloudinary)
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
            'message' => 'Evento refinado con éxito.',
            'data'    => new EventResource($event->fresh(['post.category', 'post.postMedia', 'location', 'organizer']))
        ]);
    }

    public function destroy($id)
    {
        $event = Event::where('organizer_id', auth()->id())->findOrFail($id);
        
        // Soft delete del Post asociado (que por cascada podría ocultar el evento, dependiendo de tu config, pero borramos ambos explícitamente para estar seguros)
        $event->post()->delete();
        $event->delete();

        return response()->json(['message' => 'Evento erradicado de la cartelera.']);
    }

    public function locations()
    {
        $locations = Location::select('id', 'name', 'address', 'neighborhood', 'location_type')
            ->orderBy('name', 'asc')
            ->get();

        return response()->json(['status' => 'success', 'locations' => $locations], 200);
    }

    // 🔥 GENERADOR DE TICKETS (Intacto)
    public function attend(Request $request, $id)
    {
        $event = Event::findOrFail($id);
        $user = $request->user();

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