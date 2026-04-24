<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cloudinary Configuration
    |--------------------------------------------------------------------------
    |
    | Aquí conectamos tu .env con el núcleo del paquete para evitar errores null.
    |
    */

    'cloud_url' => env('CLOUDINARY_URL'),
    
    'upload_preset' => env('CLOUDINARY_UPLOAD_PRESET'),

];