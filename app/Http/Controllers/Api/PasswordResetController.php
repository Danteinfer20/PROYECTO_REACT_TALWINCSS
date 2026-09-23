<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Rules\Contrasena;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\JsonResponse;

class PasswordResetController extends Controller
{
    /**
     * Paso 1: Enviar el enlace de recuperación al correo del usuario.
     */
    public function sendResetLink(Request $request): JsonResponse
    {
        // 1. Validar que el campo sea un correo válido
        $request->validate([
            'email' => 'required|email',
        ]);

        // 2. Usar el Broker nativo de Laravel para generar el token y enviar el correo
        $status = Password::broker()->sendResetLink(
            $request->only('email')
        );

        // 3. Responder a React según el resultado
        if ($status === Password::RESET_LINK_SENT) {
            return response()->json([
                'status' => 'success',
                'message' => 'Código de restablecimiento enviado a tu correo.'
            ], 200);
        }

        return response()->json([
            'status' => 'error',
            'message' => 'No pudimos encontrar un usuario con esa dirección de correo.'
        ], 400);
    }

    /**
     * Paso 2: Validar el token recibido y cambiar la contraseña en la base de datos.
     */
    public function resetPassword(Request $request): JsonResponse
    {
        // 1. Validar los datos obligatorios que vienen desde el formulario de React
        $request->validate([
            'token' => 'required',
            'email' => 'required|email',
            // Mismo criterio que el registro. Vive en App\Rules\Contrasena.
            // Laravel busca el campo 'password_confirmation' automáticamente.
            'password' => Contrasena::reglas(),
        ], Contrasena::mensajes());

        // 2. Ejecutar el cambio utilizando el Broker de Laravel para validar el token
        $status = Password::broker()->reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function (User $user, string $password) {
                // Cambiar la contraseña e incrementarla con el hash seguro nativo
                $user->forceFill([
                    'password' => Hash::make($password)
                ])->setRememberToken(Str::random(60));

                $user->save();

                // 🛡️ Se revocan TODAS las sesiones abiertas de esa cuenta.
                // Quien restablece su contraseña casi siempre lo hace porque
                // sospecha que alguien entró. Sin esto, el intruso conserva su
                // token y sigue adentro — el cambio de contraseña no lo toca.
                $user->tokens()->delete();

                // Disparar evento opcional de Laravel por seguridad
                event(new PasswordReset($user));
            }
        );

        // 3. Si todo sale bien, avisar a React para que redirija al Login
        if ($status === Password::PASSWORD_RESET) {
            return response()->json([
                'status' => 'success',
                'message' => 'Tu contraseña ha sido actualizada con éxito. Ya puedes ingresar.'
            ], 200);
        }

        // Si el token expiró o el correo es incorrecto, denegar el acceso
        return response()->json([
            'status' => 'error',
            'message' => 'Este enlace de recuperación es inválido o ha expirado.'
        ], 400);
    }
}