<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Http\Resources\ManagerDashboardResource;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class ManagerDashboardController extends Controller
{
    /**
     * Extrae la radiografía operativa del Gestor Cultural.
     */
    public function index(Request $request)
    {
        $user = auth('sanctum')->user();
        
        // 1. Eventos Activos Mes (Directo de la tabla events)
        $startOfMonth = Carbon::now()->startOfMonth();
        $endOfMonth = Carbon::now()->endOfMonth();
        
        $eventosActivosMes = Event::where('organizer_id', $user->id)
            ->whereBetween('start_date', [$startOfMonth, $endOfMonth])
            ->whereIn('event_status', ['scheduled', 'ongoing'])
            ->count();

        // 2. Estadísticas Globales (Consulta ultrarrápida a la tabla user_statistics)
        $stats = DB::table('user_statistics')->where('user_id', $user->id)->first();
        
        $totalRSVPs = $stats ? $stats->attendance_count : 0;
        $recaudacion = $stats ? $stats->total_revenue : 0.00;

        // 3. Próximos Eventos en Agenda
        $proximosEventos = Event::with(['post', 'location'])
            ->where('organizer_id', $user->id)
            ->where('start_date', '>=', Carbon::now())
            ->where('event_status', 'scheduled')
            ->orderBy('start_date', 'asc')
            ->take(3)
            ->get();

        // 4. Empaquetar los datos crudos
        $rawData = [
            'active_events_month' => $eventosActivosMes,
            'total_rsvps'         => (int) $totalRSVPs,
            'estimated_revenue'   => (float) $recaudacion,
            'upcoming_events'     => $proximosEventos
        ];

        // 5. Retornar a través del Resource
        return response()->json([
            'status' => 'success',
            'data'   => new ManagerDashboardResource($rawData)
        ], 200);
    }
}