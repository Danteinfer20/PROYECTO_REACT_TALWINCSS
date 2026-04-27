<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\EventAttendance;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class EventAttendanceController extends Controller
{
    /**
     * 🔥 FASE 1: Motor de Reserva para Eventos Gratuitos
     * Genera el Hash único para el Código QR y descuenta el aforo.
     */
    public function reserveFreeTicket(Request $request, $eventId): JsonResponse
    {
        $user = auth('sanctum')->user();

        if (!$user) {
            return response()->json(['status' => 'error', 'message' => 'Autenticación requerida para reservar.'], 401);
        }

        try {
            $ticket = DB::transaction(function () use ($eventId, $user) {
                $event = Event::lockForUpdate()->findOrFail($eventId);

                if ($event->price > 0) {
                    throw new \Exception("Este evento requiere procesamiento financiero P2P. Usa el flujo de compra.");
                }

                if ($event->requires_rsvp && $event->available_slots <= 0) {
                    throw new \Exception("El evento ha alcanzado su aforo máximo (Sold Out).");
                }

                $existingTicket = EventAttendance::where('event_id', $event->id)
                                                 ->where('user_id', $user->id)
                                                 ->first();
                if ($existingTicket) {
                    throw new \Exception("Ya posees un pase de acceso para este evento.");
                }

                $qrHash = 'POP-' . $event->id . 'USR-' . $user->id . '-' . strtoupper(Str::random(6));

                $attendance = EventAttendance::create([
                    'event_id'    => $event->id,
                    'user_id'     => $user->id,
                    'status'      => 'confirmed', 
                    'guest_count' => 1,
                    'qr_code'     => $qrHash,
                    'checked_in'  => false
                ]);

                if ($event->requires_rsvp) {
                    $event->decrement('available_slots');
                }

                return $attendance;
            });

            return response()->json([
                'status'  => 'success',
                'message' => 'Reserva confirmada. Tu pase de acceso está listo.',
                'data'    => [
                    'ticket_id' => $ticket->id,
                    'qr_hash'   => $ticket->qr_code,
                    'status'    => $ticket->status
                ]
            ], 201);

        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 400);
        }
    }

    /**
     * 👁️ FASE 2: Escáner de Acceso (Gestor Cultural)
     * Valida el Hash del QR en la puerta del evento.
     */
    public function checkIn(Request $request): JsonResponse
    {
        // Validación ultra-rápida inline (No requiere FormRequest por ser un solo campo)
        $request->validate([
            'qr_hash' => 'required|string'
        ]);

        try {
            $ticket = EventAttendance::with(['user', 'event.post'])
                                     ->where('qr_code', $request->qr_hash)
                                     ->first();

            // Blindaje 1: ¿El QR existe en la base de datos?
            if (!$ticket) {
                return response()->json([
                    'status' => 'error', 
                    'message' => 'ALERTA ROJA: Código QR no encontrado en los registros. Posible falsificación.'
                ], 404);
            }

            // Blindaje 2: ¿El ticket ya fue escaneado antes?
            if ($ticket->checked_in) {
                return response()->json([
                    'status' => 'error', 
                    'message' => 'ALERTA AMARILLA: Este pase ya fue utilizado el ' . $ticket->checked_in_at . '.'
                ], 409); // 409 Conflict
            }

            // Autorización de Acceso
            $ticket->update([
                'checked_in'    => true,
                'checked_in_at' => now()
            ]);

            return response()->json([
                'status'  => 'success',
                'message' => 'Acceso Autorizado. DB Actualizada.',
                'data'    => [
                    'attendee_name' => $ticket->user->name,
                    'event_title'   => $ticket->event->post->title ?? 'Evento',
                    'check_in_time' => $ticket->checked_in_at
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => 'Error procesando el escaneo.'], 500);
        }
    }

    /**
     * 🎫 FASE 3: Bóveda de Tickets (Usuario)
     * Devuelve las entradas del usuario para renderizar los QRs en React.
     */
    public function myTickets(Request $request): JsonResponse
    {
        $user = $request->user();

        // Buscamos las asistencias confirmadas y cargamos la info del evento y lugar
        $tickets = EventAttendance::with(['event.post.postMedia', 'event.location'])
                                  ->where('user_id', $user->id)
                                  ->where('status', 'confirmed')
                                  ->orderBy('created_at', 'desc')
                                  ->get();

        // Formateamos la respuesta para que React la consuma fácilmente
        $formattedTickets = $tickets->map(function ($ticket) {
            return [
                'id'            => $ticket->id,
                'qr_hash'       => $ticket->qr_code,
                'checked_in'    => $ticket->checked_in,
                'event_title'   => $ticket->event->post->title ?? 'Evento Cultural',
                'start_date'    => $ticket->event->start_date,
                'location_name' => $ticket->event->location->name ?? 'Ubicación por confirmar',
                'cover_image'   => $ticket->event->post->postMedia->where('is_cover', true)->first()->file_path ?? null,
            ];
        });

        return response()->json([
            'status' => 'success',
            'data'   => $formattedTickets
        ], 200);
    }
}