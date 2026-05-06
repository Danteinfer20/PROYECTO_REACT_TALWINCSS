<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    */

    // Rutas protegidas por el escudo CORS
    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    // 🔥 MATRIZ DINÁMICA DE ORÍGENES:
    // Lee la variable de Railway, pero mantiene localhost como red de seguridad local.
    'allowed_origins' => [
        env('FRONTEND_URL', 'http://localhost:5173'),
        'http://localhost:5173',
    ],

    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,

    // 🛡️ REGLA ESTRICTA: Obligatorio en true para soportar tokens de autenticación
    'supports_credentials' => true,

];