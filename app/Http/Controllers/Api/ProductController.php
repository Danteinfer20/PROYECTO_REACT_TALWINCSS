<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class ProductController extends Controller
{
    // Listar productos
    public function index(Request $request)
    {
        $query = Product::with('user:id,name');

        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        return response()->json($query->latest()->get());
    }

    // Guardar un nuevo producto
    public function store(Request $request)
    {
        // ENVUELVO TODO ABSOLUTAMENTE EN UN TRY-CATCH
        try {
            // 1. Validamos
            $request->validate([
                'name' => 'required|string|max:200',
                'price' => 'required|numeric|min:0',
                'product_type' => 'required|in:physical,digital,service,handicraft',
                'stock_quantity' => 'required|integer|min:0',
                'main_image' => 'required|image', 
            ]);

            // 2. Subimos la foto
            $path = $request->file('main_image')->store('products', 'public');

            // 3. Creamos el producto
            $product = Product::create([
                'user_id' => Auth::id() ?? 1, 
                'category_id' => $request->category_id ?? 1, 
                'name' => $request->name,
                'description' => $request->description ?? 'Sin descripción',
                'price' => $request->price,
                'stock_quantity' => $request->stock_quantity,
                'product_type' => $request->product_type,
                'main_image' => $path,
                'status' => 'available'
            ]);

            return response()->json(['message' => 'Producto publicado con éxito', 'data' => $product], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            // SI EL ERROR ES POR UN DATO FALTANTE O INCORRECTO DEL FORMULARIO
            return response()->json([
                'ERROR_REAL' => 'Falta un dato o es incorrecto: ' . json_encode($e->errors())
            ], 422);

        } catch (\Throwable $e) {
            // SI EL ERROR ES DE POSTGRESQL (Ej. Llaves foráneas, tablas vacías)
            return response()->json([
                'ERROR_REAL' => 'Fallo en la Base de Datos: ' . $e->getMessage()
            ], 500);
        }
    }
}