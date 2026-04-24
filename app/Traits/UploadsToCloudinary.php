<?php

namespace App\Traits;

use Cloudinary\Cloudinary;
use Exception;

trait UploadsToCloudinary
{
    /**
     * Sube un archivo a Cloudinary usando el Motor Nativo puro.
     * * @param \Illuminate\Http\UploadedFile $file
     * @param string $folder
     * @return string URL segura de la imagen
     */
    public function uploadImageToCloud ($file, $folder = 'popayan/general')
    {
        $cloudinaryUrl = env('CLOUDINARY_URL');
        
        if (!$cloudinaryUrl) {
            throw new Exception('Error de Arquitectura: CLOUDINARY_URL no encontrada en el .env');
        }

        $cloudinary = new Cloudinary($cloudinaryUrl);

        $response = $cloudinary->uploadApi()->upload($file->getRealPath(), [
            'folder' => $folder,
            'upload_preset' => env('CLOUDINARY_UPLOAD_PRESET', 'default')
        ]);

        return $response['secure_url'];
    }
}
