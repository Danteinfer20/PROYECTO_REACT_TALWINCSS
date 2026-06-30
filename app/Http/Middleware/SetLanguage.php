<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SetLanguage
{
    public function handle(Request $request, Closure $next): Response
    {
        // Obtenemos el header que enviará React, por defecto 'es'
        $lang = $request->header('X-Localization', 'es');

        // Validamos que solo aceptemos los idiomas permitidos
        if (in_array($lang, ['es', 'en'])) {
            app()->setLocale($lang);
        } else {
            app()->setLocale('es');
        }

        return $next($request);
    }
}