<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\EventAttendance;
use App\Http\Resources\TicketSaleResource;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class EventSalesController extends Controller
{
    /**
     * Listado maestro de taquilla para el Gestor Cultural.
     */
    public function index(): JsonResponse
    {
        $user = Auth::user();

        // Buscamos asistencias donde el evento pertenezca al organizador logueado
        $sales = EventAttendance::whereHas('event', function ($query) use ($user) {
            $query->where('organizer_id', $user->id);
        })
        ->with(['event.post', 'user']) // Eager loading para evitar el problema N+1
        ->latest()
        ->get();

        return response()->json([
            'status' => 'success',
            'message' => 'Reporte de taquilla generado.',
            'data' => TicketSaleResource::collection($sales),
            'meta' => [
                'total_revenue' => $sales->sum(function($sale) {
                    $price = $sale->event->price ?? 0;
                    $guestCount = $sale->guest_count ?? 1;
                    return $price * $guestCount;
                })
            ]
        ], 200);
    }
}