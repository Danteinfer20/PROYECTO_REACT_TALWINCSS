<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\CreatorApplication;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminDashboardController extends Controller
{
    /**
     * Carga el escritorio principal del Administrador (Métricas y Solicitudes)
     */
    public function index()
    {
        try {
            // 1. Calculamos los KPIs Globales
            $kpis = [
                'total_users' => User::count(),
                'verified_creators' => User::where('is_verified', true)->count(),
                'total_revenue' => 0, // Aquí conectaremos la tabla de órdenes luego
                'active_events' => 0, // Aquí conectaremos la tabla de eventos luego
            ];

            // 2. Extraemos la "Fila de Espera" (Postulaciones pendientes)
            // Usamos 'with' para traer los datos del usuario (nombre, avatar) en la misma consulta
            $pendingApplications = CreatorApplication::with(['user' => function($query) {
                                            $query->select('id', 'name', 'email', 'profile_picture');
                                        }])
                                        ->where('status', 'pending')
                                        ->orderBy('created_at', 'asc')
                                        ->get();

            return response()->json([
                'status' => 'success',
                'data' => [
                    'kpis' => $kpis,
                    'pending_applications' => $pendingApplications
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Fallo en el núcleo de administración: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * El Veredicto: Aprueba a un creador y le da acceso al Taller Creativo
     */
    public function approveCreator(Request $request, $id)
    {
        try {
            DB::transaction(function () use ($id, $request) {
                // 1. Buscar la solicitud
                $application = CreatorApplication::findOrFail($id);
                
                // 2. Sellar la solicitud como aprobada
                $application->update([
                    'status' => 'approved',
                    'reviewed_by' => $request->user()->id,
                    'reviewed_at' => now()
                ]);

                // 3. Ascender al usuario (La llave maestra)
                $user = User::findOrFail($application->user_id);
                $user->update([
                    'user_type' => $application->proposed_type,
                    'is_verified' => true
                ]);
            });

            return response()->json([
                'status' => 'success',
                'message' => '¡Veredicto emitido! El usuario ha sido ascendido a Creador Verificado.'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Error al aprobar la solicitud: ' . $e->getMessage()
            ], 500);
        }
    }

    // (Mantendremos estos métodos listos para futuras implementaciones de gestión de usuarios)
    public function getUsers()
    {
        $users = User::orderBy('created_at', 'desc')->get();
        return response()->json(['status' => 'success', 'data' => $users], 200);
    }

    public function updateUserStatus(Request $request, $id)
    {
        $user = User::findOrFail($id);
        $user->update(['status' => $request->status]);
        return response()->json(['status' => 'success', 'message' => 'Estado actualizado.'], 200);
    }
}