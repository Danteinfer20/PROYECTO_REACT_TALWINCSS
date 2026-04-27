<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\CreatorApplication;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

// Capas de Seguridad y Transformación
use App\Http\Resources\Admin\UserCollectionResource;
use App\Http\Resources\Admin\ApprovedUserResource;
use App\Http\Requests\Admin\ApproveCreatorRequest;
use App\Http\Requests\Admin\UpdateUserStatusRequest;
use App\Http\Requests\Admin\RejectCreatorRequest; // 🔥 INYECCIÓN: Escudo de validación para rechazos

class AdminDashboardController extends Controller
{
    /**
     * 🌐 COMANDO CENTRAL (Para la vista AdminDashboard)
     */
    public function index(): JsonResponse
    {
        try {
            $kpis = [
                'total_users' => User::count(),
                'verified_creators' => User::where('is_verified', true)->count(),
                'total_revenue' => 0, 
                'active_events' => 0,
            ];

            $pendingApplications = CreatorApplication::with('user')
                ->where('status', 'pending')
                ->latest()
                ->get();
            
            $users = User::latest()->take(100)->get();

            return response()->json([
                'status' => 'success',
                'data' => [
                    'kpis' => $kpis,
                    'pending_applications' => $pendingApplications,
                    'all_users' => UserCollectionResource::collection($users) 
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * 📊 CENSO TOTAL BAJO DEMANDA (Para la vista UsuariosView)
     */
    public function getUsers(): JsonResponse
    {
        try {
            $users = User::latest()->get();
            
            return response()->json([
                'status' => 'success',
                'data' => UserCollectionResource::collection($users)
            ], 200);
            
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * ⚖️ EL VEREDICTO (Para aprobar ascensos)
     */
    public function approveCreator(ApproveCreatorRequest $request, $id): JsonResponse
    {
        try {
            $user = DB::transaction(function () use ($id, $request) {
                $application = CreatorApplication::findOrFail($id);
                $application->update([
                    'status' => 'approved', 
                    'reviewed_at' => now(),
                    'reviewed_by' => Auth::id()
                ]);

                $user = User::findOrFail($application->user_id);
                $user->update([
                    'user_type' => $request->assigned_role, 
                    'is_verified' => true
                ]);

                return $user;
            });
            
            return response()->json(new ApprovedUserResource($user), 200);
            
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * ❌ EL VEREDICTO (Para denegar ascensos) - 🔥 INYECCIÓN
     */
    public function rejectCreator(RejectCreatorRequest $request, $id): JsonResponse
    {
        try {
            $application = CreatorApplication::findOrFail($id);
            
            $application->update([
                'status' => 'rejected',
                'rejection_reason' => $request->rejection_reason,
                'reviewed_at' => now(),
                'reviewed_by' => Auth::id()
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'La solicitud ha sido denegada y el motivo registrado en bitácora.'
            ], 200);
            
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * 🚫 CONTROL DE ESTADO (Para suspender/activar)
     */
    public function updateUserStatus(UpdateUserStatusRequest $request, $id): JsonResponse
    {
        try {
            $user = User::findOrFail($id);
            $user->update(['status' => $request->status]);

            return response()->json([
                'status' => 'success', 
                'message' => 'Estado operativo actualizado correctamente.'
            ], 200);

        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }
}