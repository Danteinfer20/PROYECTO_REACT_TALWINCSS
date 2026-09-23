<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Cabeceras de seguridad en toda respuesta.
 *
 * Son instrucciones para el navegador sobre qué NO debe permitir. No arreglan
 * un fallo del código: le quitan al atacante las formas más baratas de
 * aprovecharlo. Antes no se enviaba ninguna — lo único presente era un
 * `upgrade-insecure-requests` que pone el servidor, no la aplicación.
 */
class CabecerasDeSeguridad
{
    public function handle(Request $request, Closure $next): Response
    {
        $respuesta = $next($request);

        // El navegador respeta el Content-Type que declaramos y no "adivina" otro.
        // Sin esto, un .txt subido por un usuario puede terminar ejecutándose como
        // JavaScript porque el navegador creyó reconocerlo.
        $respuesta->headers->set('X-Content-Type-Options', 'nosniff');

        // Nadie puede meter este sitio dentro de un <iframe>. Cierra el clickjacking:
        // la página falsa que superpone un botón invisible sobre el nuestro.
        // ⚠️ Si algún día hay que permitir que un aliado lo embeba, esto pasa a
        // 'SAMEORIGIN' o se reemplaza por frame-ancestors en una CSP.
        $respuesta->headers->set('X-Frame-Options', 'DENY');

        // Al salir del sitio se manda el dominio, nunca la ruta completa. Así una
        // URL con datos adentro no viaja como referente a un tercero.
        $respuesta->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');

        // El sitio no usa cámara, micrófono ni ubicación: se renuncia a permitirlos.
        // Si mañana el escáner de QR los necesita, se agrega 'camera=(self)'.
        $respuesta->headers->set(
            'Permissions-Policy',
            'camera=(), microphone=(), geolocation=(), interest-cohort=()'
        );

        // HSTS: el navegador recuerda por un año que este dominio es solo HTTPS, y
        // deja de intentar el primer salto por HTTP —que es donde se intercepta.
        // Solo en producción y solo sobre una conexión ya segura: enviarlo en
        // desarrollo dejaría a localhost obligado a HTTPS en tu propio navegador,
        // y eso no se deshace fácil.
        if (app()->environment('production') && $request->secure()) {
            $respuesta->headers->set(
                'Strict-Transport-Security',
                'max-age=31536000; includeSubDomains'
            );
        }

        return $respuesta;
    }
}
