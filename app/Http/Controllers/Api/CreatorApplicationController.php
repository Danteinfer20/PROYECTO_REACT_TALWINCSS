<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CreatorApplication;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail; 
use App\Mail\ManifestoCommitmentMail; 

class CreatorApplicationController extends Controller
{
    // 🔥 Hemos eliminado el trait de Cloudinary. Ya no se necesita aquí.

    public function store(Request $request)
    {
        try {
            $user = $request->user();

            // Validación (Ahora portfolio_url es requerido)
            $data = $request->validate([
                'proposed_type' => 'required|in:artist,cultural_manager,educator',
                'portfolio_url' => 'required|url|max:255', // Obligatorio
                'message'       => 'required|string|min:20|max:2000',
            ]);

            // Prevención de Spam
            $hasPending = CreatorApplication::where('user_id', $user->id)
                                            ->where('status', 'pending')
                                            ->exists();

            if ($hasPending) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Ya tienes una solicitud en proceso de revisión por la Corte de Curaduría.'
                ], 422);
            }

            // Transacción súper ligera
            $application = DB::transaction(function () use ($data, $user) {
                return CreatorApplication::create([
                    'user_id' => $user->id,
                    'proposed_type' => $data['proposed_type'],
                    'portfolio_url' => $data['portfolio_url'], 
                    'evidence_file' => null, // Dejamos esto en null por diseño Lean
                    'message' => $data['message'],
                    'status' => 'pending'
                ]);
            });

            // Disparador del correo
            Mail::to($user->email)->send(new ManifestoCommitmentMail($user));

            return response()->json([
                'status' => 'success',
                'message' => 'Solicitud enviada exitosamente. El Administrador revisará tu perfil pronto.',
                'data' => $application
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Error al procesar la solicitud: ' . $e->getMessage()
            ], 500);
        }
    }
}