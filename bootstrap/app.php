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
        
        // 🔥 SOLUCIÓN CORS: Habilitamos el middleware global para React
        $middleware->append(\Illuminate\Http\Middleware\HandleCors::class);

        // 🔥 REGISTRO DE TODOS NUESTROS GUARDIANES (ALIAS)
        $middleware->alias([
            'admin' => \App\Http\Middleware\AdminMiddleware::class,
            'verified_creator' => \App\Http\Middleware\VerifiedCreator::class,
            'checkStatus' => \App\Http\Middleware\CheckUserStatus::class, // 🛡️ NUEVO: El guardián anti-suspensión
        ]);

    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();