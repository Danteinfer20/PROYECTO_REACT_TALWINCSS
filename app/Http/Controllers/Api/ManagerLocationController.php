<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Location;
use App\Http\Resources\LocationResource;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Traits\UploadsToCloudinary; // 🔥 Requerido para las fotos

class ManagerLocationController extends Controller
{
    use UploadsToCloudinary;

    /**
     * Listado maestro de locaciones.
     */
    public function index(): JsonResponse
    {
        $locations = Location::orderBy('name', 'asc')->get();

        return response()->json([
            'status' => 'success',
            'data'   => LocationResource::collection($locations)
        ], 200);
    }

    /**
     * 🔥 FORJA: Registrar un nuevo recinto cultural.
     */
    public function store(Request $request): JsonResponse
    {
        // Validación básica en controlador (Skinny style)
        $request->validate([
            'name' => 'required|string|max:150',
            'address' => 'required|string|max:255',
            'location_type' => 'required|string',
        ]);

        $data = $request->all();

        // Procesamiento de imagen si existe
        if ($request->hasFile('photo')) {
            $data['photo'] = $this->uploadImageToCloud($request->file('photo'), 'popayan/locations');
        }

        $location = Location::create($data);

        return response()->json([
            'status' => 'success',
            'message' => 'Recinto forjado exitosamente.',
            'data' => new LocationResource($location)
        ], 201);
    }

    /**
     * 🔥 REFINAMIENTO: Actualizar datos de un recinto.
     */
    public function update(Request $request, $id): JsonResponse
    {
        $location = Location::findOrFail($id);
        $data = $request->all();

        if ($request->hasFile('photo')) {
            $data['photo'] = $this->uploadImageToCloud($request->file('photo'), 'popayan/locations');
        }

        $location->update($data);

        return response()->json([
            'status' => 'success',
            'message' => 'Recinto actualizado con éxito.',
            'data' => new LocationResource($location)
        ], 200);
    }

    /**
     * ERRADICACIÓN: Eliminar recinto.
     */
    public function destroy($id): JsonResponse
    {
        $location = Location::findOrFail($id);
        $location->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Recinto erradicado del inventario.'
        ], 200);
    }
}