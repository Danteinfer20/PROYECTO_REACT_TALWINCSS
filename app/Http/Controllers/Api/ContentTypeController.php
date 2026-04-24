<?php

namespace App\Http\Controllers\Api;

use App\Models\ContentType;
use Illuminate\Http\Request;
use App\Http\Resources\ContentTypeResource; // 🔥 Importamos el Resource

class ContentTypeController extends BaseController
{
    public function index()
    {
        $contentTypes = ContentType::orderBy('name', 'asc')->get();
        
        // Retornamos la colección a través del Resource
        return $this->sendResponse(
            ContentTypeResource::collection($contentTypes), 
            'Clasificaciones recuperadas.'
        );
    }
}