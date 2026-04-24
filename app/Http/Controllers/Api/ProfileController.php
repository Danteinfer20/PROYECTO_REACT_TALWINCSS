<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Http\Requests\UpdateProfileRequest;
use Illuminate\Support\Facades\DB;
use Cloudinary\Cloudinary; 
use App\Models\User;

class ProfileController extends Controller
{
    /**
     * Actualiza la información principal y sincroniza las imágenes con Cloudinary
     */
    public function update(UpdateProfileRequest $request)
    {
        $user = $request->user();

        // 🔥 LA OPCIÓN NUCLEAR: Bypass total de Eloquent para garantizar la escritura en PostgreSQL
        // Extraemos los datos exactos que vienen de React
        $phoneValue = $request->input('phone');
        
        DB::table('users')->where('id', $user->id)->update([
            'name'         => $request->input('name', $user->name),
            'bio'          => $request->input('bio', $user->bio),
            // Forzamos la inyección del teléfono. Si viene vacío, lo ponemos como null.
            'phone'        => empty($phoneValue) ? null : $phoneValue, 
            'city'         => $request->input('city', $user->city),
            'neighborhood' => $request->input('neighborhood', $user->neighborhood),
            'website'      => $request->input('website', $user->website),
            'updated_at'   => now()
        ]);

        // Tratamiento riguroso para JSONB
        if ($request->has('social_media')) {
            $sm = $request->input('social_media');
            DB::table('users')->where('id', $user->id)->update([
                'social_media' => is_string($sm) ? $sm : json_encode($sm)
            ]);
        }

        // 🔥 MOTOR MULTI-CLOUDINARY (Mantenemos Eloquent solo para las imágenes)
        $cloudinaryUrl = env('CLOUDINARY_URL');
        if (!$cloudinaryUrl) {
            return response()->json(['message' => 'Error de Arquitectura: CLOUDINARY_URL no encontrada en el .env'], 500);
        }

        $cloudinary = new Cloudinary($cloudinaryUrl);
        $imagesUpdated = false;

        if ($request->hasFile('profile_picture')) {
            $file = $request->file('profile_picture');
            $response = $cloudinary->uploadApi()->upload($file->getRealPath(), [
                'folder' => 'popayan/profiles',
                'upload_preset' => env('CLOUDINARY_UPLOAD_PRESET', 'default')
            ]);
            $user->profile_picture = $response['secure_url'];
            $imagesUpdated = true;
        }

        if ($request->hasFile('cover_picture')) {
            $file = $request->file('cover_picture');
            $responseCover = $cloudinary->uploadApi()->upload($file->getRealPath(), [
                'folder' => 'popayan/covers',
                'upload_preset' => env('CLOUDINARY_UPLOAD_PRESET', 'default')
            ]);
            $user->cover_picture = $responseCover['secure_url'];
            $imagesUpdated = true;
        }

        if ($imagesUpdated) {
            $user->save(); // Solo guardamos con Eloquent si las imágenes cambiaron
        }

        // Refrescamos el usuario directamente desde la base de datos recién alterada
        $refreshedUser = User::find($user->id);

        return response()->json([
            'status' => 'success',
            'message' => 'Perfil inyectado en PostgreSQL y sincronizado con Cloudinary.',
            'user' => $refreshedUser
        ], 200);
    }

    /**
     * Actualiza las configuraciones de privacidad (user_settings).
     */
    public function updateSettings(Request $request)
    {
        $user = $request->user();
        
        $validated = $request->validate([
            'public_profile' => 'boolean',
            'email_notifications' => 'boolean',
            'nearby_events_notify' => 'boolean',
        ]);

        DB::table('user_settings')->updateOrInsert(
            ['user_id' => $user->id],
            array_merge($validated, ['updated_at' => now()])
        );

        return response()->json([
            'status' => 'success',
            'message' => 'Ajustes de privacidad actualizados.'
        ], 200);
    }
}