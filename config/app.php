<?php

use Illuminate\Support\Facades\Facade;
use Illuminate\Support\ServiceProvider;

return [

    'name' => env('APP_NAME', 'Laravel'),
    'env' => env('APP_ENV', 'production'),
    'debug' => (bool) env('APP_DEBUG', false),
    'url' => env('APP_URL', 'http://localhost'),

    // Origen del SPA. Se usa para armar los enlaces de los correos (recuperar
    // contraseña, verificar correo) y lo lee también config/cors.php.
    // Va acá y no con env() suelto: si algún día se cachea la configuración,
    // un env() fuera de config/ devuelve null y los correos salen con enlaces rotos.
    'frontend_url' => env('FRONTEND_URL', 'http://localhost:5173'),
    
    // 🔥 Cambio crítico: zona horaria de Colombia (UTC-5)
    'timezone' => 'America/Bogota',
    
    // 🔥 Idioma por defecto: español
    'locale' => 'es',
    'fallback_locale' => 'es',
    'faker_locale' => env('APP_FAKER_LOCALE', 'es_ES'),
    
    'cipher' => 'AES-256-CBC',
    'key' => env('APP_KEY'),
    'previous_keys' => [
        ...array_filter(explode(',', env('APP_PREVIOUS_KEYS', ''))),
    ],
    'maintenance' => [
        'driver' => env('APP_MAINTENANCE_DRIVER', 'file'),
        'store' => env('APP_MAINTENANCE_STORE', 'database'),
    ],

    'providers' => ServiceProvider::defaultProviders()->merge([
        // Package Service Providers
        CloudinaryLabs\CloudinaryLaravel\CloudinaryServiceProvider::class,

        // Application Service Providers
        App\Providers\AppServiceProvider::class,
    ])->toArray(),

    'aliases' => Facade::defaultAliases()->merge([
        'Cloudinary' => CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary::class,
    ])->toArray(),

];