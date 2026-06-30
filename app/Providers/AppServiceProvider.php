<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Auth\Notifications\ResetPassword; // 🔥 Importante para recuperar clave
use Illuminate\Auth\Notifications\VerifyEmail;   // 🔥 Importante para verificar correo

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // =========================================================
        // 🚀 INTERCEPCIÓN DE RUTAS PARA ARQUITECTURA API + REACT
        // =========================================================

        // 1. EDUCAR A LARAVEL: Enlace de Recuperación de Contraseña
        ResetPassword::createUrlUsing(function (object $notifiable, string $token) {
            // Apuntamos al puerto de React (5173) y le pasamos el token y el correo por URL
            $frontendUrl = env('FRONTEND_URL', 'http://localhost:5173');
            return $frontendUrl . "/reset-password?token={$token}&email={$notifiable->getEmailForPasswordReset()}";
        });

        // 2. EDUCAR A LARAVEL: Enlace de Verificación de Correo (Para evitar el mismo error al registrarse)
        VerifyEmail::createUrlUsing(function (object $notifiable) {
            $frontendUrl = env('FRONTEND_URL', 'http://localhost:5173');
            $id = $notifiable->getKey();
            $hash = sha1($notifiable->getEmailForVerification());
            
            // Apuntamos a la vista de React que procesará la verificación
            return $frontendUrl . "/verify-email?id={$id}&hash={$hash}";
        });
    }
}