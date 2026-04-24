<?php

namespace App\Http\Controllers\Api;

use App\Models\Product;
use App\Http\Resources\ProductResource;
use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use App\Traits\UploadsToCloudinary; 
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class ProductController extends BaseController
{
    use UploadsToCloudinary; 

    public function index(Request $request)
    {
        // 🔥 CORRECCIÓN APLICADA: Inyectamos 'user' para que el Resource pueda enviar el teléfono
        $query = Product::with(['productImages', 'user', 'category']);

        $user = auth('sanctum')->user();
        $kpis = null;

        if ($request->has('my_products') && $user) {
            $query->where('user_id', $user->id);
            
            $stats = \App\Models\UserStatistic::where('user_id', $user->id)->first();
            $totalStock = Product::where('user_id', $user->id)->sum('stock_quantity');

            $kpis = [
                'total_revenue' => $stats ? (float) $stats->total_revenue : 0,
                'total_sales'   => $stats ? (int) $stats->sales_count : 0,
                'total_stock'   => (int) $totalStock
            ];
        } else {
            $query->available();
        }

        $query->when($request->category_id, fn($q, $cat) => $q->where('category_id', $cat))
              ->when($request->user_id, fn($q, $userId) => $q->where('user_id', $userId))
              ->when($request->search, fn($q, $search) => $q->where('name', 'ilike', "%{$search}%"));

        $products = $query->latest()->paginate(15);

        if ($kpis) {
            return ProductResource::collection($products)->additional([
                'meta' => [
                    'kpis' => $kpis
                ]
            ]);
        }

        return ProductResource::collection($products);
    }

    public function show($id): JsonResponse
    {
        // 🔥 CORRECCIÓN APLICADA AQUÍ TAMBIÉN: Para la vista rápida/detalle
        $product = Product::with(['productImages', 'user', 'category'])->find($id);

        if (!$product) return $this->sendError('Producto no encontrado.', [], 404);

        if ($product->status !== 'available' && optional(auth('sanctum')->user())->id !== $product->user_id) {
            return $this->sendError('Activo fuera de escaparate.', [], 403);
        }

        return $this->sendResponse(new ProductResource($product), 'Detalle recuperado.');
    }

    public function store(StoreProductRequest $request): JsonResponse
    {
        $status = $this->mapStatus($request->status, $request->stock_quantity);

        $product = DB::transaction(function () use ($request, $status) {
            $newProduct = Product::create([
                'user_id' => $request->user()->id,
                'name' => $request->name,
                'category_id' => $request->category_id,
                'description' => $request->description,
                'price' => $request->price,
                'stock_quantity' => $request->stock_quantity,
                'status' => $status,
                'product_type' => $request->input('product_type', 'physical'),
            ]);

            if ($request->hasFile('images')) {
                $images = $request->file('images');

                foreach ($images as $index => $file) {
                    $url = $this->uploadImageToCloud($file, 'popayan/products');

                    if ($index === 0) {
                        $newProduct->update(['main_image' => $url]);
                    }

                    $newProduct->productImages()->create([
                        'image_path' => $url,
                        'sort_order' => $index,
                        'is_primary' => $index === 0 ? true : false,
                    ]);
                }
            }

            return $newProduct;
        });

        $product->load(['productImages', 'user', 'category']); // 🔥 Carga relaciones después de forjar

        return $this->sendResponse(new ProductResource($product), 'Activo y galería forjados en la nube.', 201);
    }

    public function update(UpdateProductRequest $request, $id): JsonResponse
    {
        $product = Product::findOrFail($id);

        if ($product->user_id !== $request->user()->id) {
            return $this->sendError('No autorizado.', [], 403);
        }

        $data = $request->validated();

        if (isset($data['status']) || isset($data['stock_quantity'])) {
            $data['status'] = $this->mapStatus(
                $data['status'] ?? $product->status, 
                $data['stock_quantity'] ?? $product->stock_quantity
            );
        }

        if ($request->hasFile('images')) {
            $images = $request->file('images');
            
            $product->productImages()->delete();

            foreach ($images as $index => $file) {
                $url = $this->uploadImageToCloud($file, 'popayan/products');

                if ($index === 0) {
                    $data['main_image'] = $url; 
                }

                $product->productImages()->create([
                    'image_path' => $url,
                    'sort_order' => $index,
                    'is_primary' => $index === 0 ? true : false,
                ]);
            }
        }

        $product->update($data);
        $product->load(['productImages', 'user', 'category']); // 🔥 Carga relaciones después de refinar

        return $this->sendResponse(new ProductResource($product), 'Producto y galería refinados.');
    }

    public function destroy(Request $request, $id): JsonResponse
    {
        $product = Product::findOrFail($id);

        if ($product->user_id !== $request->user()->id) {
            return $this->sendError('No autorizado.', [], 403);
        }

        $product->delete();

        return $this->sendResponse([], 'Activo erradicado.');
    }

    private function mapStatus($status, $stock)
    {
        if ($stock <= 0) return 'sold_out';
        if ($status === 'published') return 'available';
        if ($status === 'draft') return 'paused';
        return $status ?? 'available';
    }
}