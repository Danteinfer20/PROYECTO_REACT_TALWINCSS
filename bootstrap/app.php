<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {

        // 🔥 REDUNDANCIA CORS ELIMINADA:
        // Laravel 11 ya inyecta el middleware HandleCors automáticamente al existir config/cors.php.
        // Forzar el append aquí causaba la colisión de cabeceras.

        // 🔥 REGISTRO DE TODOS NUESTROS GUARDIANES (ALIAS)
        $middleware->alias([
            'admin' => \App\Http\Middleware\AdminMiddleware::class,
            'verified_creator' => \App\Http\Middleware\VerifiedCreator::class,
            'checkStatus' => \App\Http\Middleware\CheckUserStatus::class, // 🛡️ El guardián anti-suspensión
            'set_lang' => \App\Http\Middleware\SetLanguage::class, // ✅ Nuevo guardián de idioma
        ]);

        // Cabeceras de seguridad en TODA respuesta, sea de la API o del SPA.
        // Va en los dos grupos a propósito: la página que sirve el sitio necesita
        // la protección contra clickjacking tanto como la API.
        $middleware->web(append: [
            \App\Http\Middleware\CabecerasDeSeguridad::class,
        ]);

        // ✅ INYECCIÓN GLOBAL EN LA API
        $middleware->api(append: [
            \App\Http\Middleware\SetLanguage::class,
            \App\Http\Middleware\CabecerasDeSeguridad::class,
        ]);

    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
