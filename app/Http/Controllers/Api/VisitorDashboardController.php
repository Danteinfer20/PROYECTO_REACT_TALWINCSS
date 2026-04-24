<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB; // 🔥 IMPORTANTE: Usaremos DB Facade
use Carbon\Carbon;
use App\Models\SavedItem;
use App\Models\Order;
use App\Models\EventAttendance;

class VisitorDashboardController extends Controller
{
    public function index(Request $request)
    {
        try {
            $userId = Auth::id();

            // 1. 📊 CONTEOS BÁSICOS (Seguros porque solo cuentan filas directas)
            $favoritesCount = SavedItem::where('user_id', $userId)->count();
            $ordersCount = Order::where('user_id', $userId)->count();
            $ticketsCount = EventAttendance::where('user_id', $userId)
                                           ->where('status', 'confirmed')
                                           ->count();

            // 2. 🎟️ AGENDA VIP (SQL PURO - A prueba de fallos de Modelos)
            // Hacemos los JOINs directos en la base de datos basándonos en tu SQL
            $upcomingEventsRaw = DB::table('event_attendance')
                ->join('events', 'event_attendance.event_id', '=', 'events.id')
                ->join('posts', 'events.post_id', '=', 'posts.id')
                ->leftJoin('locations', 'events.location_id', '=', 'locations.id')
                ->select(
                    'events.id',
                    'posts.id as post_id',
                    'posts.title as nombre',
                    'events.start_date',
                    'locations.name as lugar'
                )
                ->where('event_attendance.user_id', $userId)
                ->where('event_attendance.status', 'confirmed')
                ->where('events.start_date', '>=', Carbon::now())
                ->orderBy('events.start_date', 'asc')
                ->limit(3)
                ->get();

            // 3. 🛠️ FORMATEO Y EXTRACCIÓN DE IMAGEN
            $formattedEvents = $upcomingEventsRaw->map(function ($event) {
                $date = Carbon::parse($event->start_date);
                
                // Buscamos la imagen en post_media de forma segura
                $media = DB::table('post_media')->where('post_id', $event->post_id)->first();
                
                return [
                    'id' => $event->id,
                    'nombre' => $event->nombre,
                    'fecha' => $date->translatedFormat('d M Y'),
                    'hora' => $date->format('H:i') . ' Hrs',
                    'lugar' => $event->lugar ?? 'Por definir',
                    'asiento' => 'Pase Generado',
                    // Usamos file_path tal como dicta tu estructura SQL
                    'imagen' => $media ? $media->file_path : null,
                ];
            });

            // 🚀 RESPUESTA EXITOSA
            return response()->json([
                'status' => 'success',
                'data' => [
                    'stats' => [
                        'favorites_count' => $favoritesCount,
                        'orders_count' => $ordersCount,
                        'tickets_count' => $ticketsCount,
                    ],
                    'upcoming_events' => $formattedEvents
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Falla en BD: ' . $e->getMessage() . ' Línea: ' . $e->getLine()
            ], 500);
        }
    }
}