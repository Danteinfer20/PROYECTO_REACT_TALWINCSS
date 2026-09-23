<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\URL;
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
        $this->forzarHttpsEnProduccion();
        $this->registrarLimitesDeIntentos();
        $this->educarLosEnlacesDeCorreo();
    }

    /**
     * En producción, toda URL que genere Laravel va por HTTPS.
     *
     * El sitio ya se sirve por HTTPS, pero detrás del proxy del hosting Laravel
     * puede ver la petición como HTTP y armar enlaces `http://` — en un correo de
     * recuperación de contraseña, eso es un token de un solo uso viajando en claro.
     */
    private function forzarHttpsEnProduccion(): void
    {
        if ($this->app->environment('production')) {
            URL::forceScheme('https');
        }
    }

    /**
     * Límites de intentos.
     *
     * 🚨 Antes no había ninguno: se podían probar contraseñas contra /login sin
     * freno, tantas por segundo como aguantara el servidor. Con 23 cuentas reales
     * y sin segundo factor, eso es la puerta más barata que tenía el sistema.
     *
     * La clave combina correo + IP a propósito. Solo por IP, una oficina entera
     * comparte el cupo y se bloquean entre compañeros; solo por correo, alguien
     * puede dejar afuera a una persona a la que quiera molestar.
     */
    private function registrarLimitesDeIntentos(): void
    {
        RateLimiter::for('entrada', function (Request $request) {
            return Limit::perMinute(6)->by(
                mb_strtolower((string) $request->input('email')) . '|' . $request->ip()
            );
        });

        // Más estricto: cada intento acá dispara un correo real a una persona.
        // Sin tope, el formulario se convierte en una máquina de mandar spam.
        RateLimiter::for('recuperacion', function (Request $request) {
            return Limit::perMinute(3)->by(
                mb_strtolower((string) $request->input('email')) . '|' . $request->ip()
            );
        });
    }

    /**
     * Los enlaces de los correos apuntan al SPA, no a Laravel.
     */
    private function educarLosEnlacesDeCorreo(): void
    {
        $frontend = rtrim((string) config('app.frontend_url'), '/');

        // 1. Recuperación de contraseña
        ResetPassword::createUrlUsing(function (object $notifiable, string $token) use ($frontend) {
            $correo = urlencode($notifiable->getEmailForPasswordReset());

            return "{$frontend}/reset-password?token={$token}&email={$correo}";
        });

        // 2. Verificación de correo
        VerifyEmail::createUrlUsing(function (object $notifiable) use ($frontend) {
            $id = $notifiable->getKey();
            $hash = sha1($notifiable->getEmailForVerification());

            return "{$frontend}/verify-email?id={$id}&hash={$hash}";
        });
    }
}
