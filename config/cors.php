<?php

return [

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    /*
     | Qué orígenes pueden llamar a esta API desde un navegador.
     |
     | 🛡️ Antes la lista incluía 'http://localhost:5173' SIEMPRE, también en
     | producción. Eso significa que una página servida desde el localhost de
     | cualquier persona podía llamar a la API de vivelarte.com con credenciales
     | —porque `supports_credentials` está en true— y leer la respuesta. Ahora
     | el origen de desarrollo solo se admite fuera de producción.
     */
    'allowed_origins' => array_values(array_filter(array_unique([
        config('app.frontend_url'),
        config('app.env') === 'production' ? null : 'http://localhost:5173',
        config('app.env') === 'production' ? null : 'http://127.0.0.1:5173',
    ]))),

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    // Necesario para el modo SPA de Sanctum (cookie httpOnly). Es también lo que
    // hace que la lista de orígenes de arriba tenga que ser estricta.
    'supports_credentials' => true,

];
