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
        } 
        else if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id)->available();
        }
        else {
            $query->available();
        }

        $query->when($request->category_id, fn($q, $cat) => $q->where('category_id', $cat))
              ->when($request->search, fn($q, $search) => $q->where('name', 'ilike', "%{$search}%"));

        $products = $query->latest()->paginate(15);

        return $kpis 
            ? ProductResource::collection($products)->additional(['meta' => ['kpis' => $kpis]])
            : ProductResource::collection($products);
    }

    public function show($id): JsonResponse
    {
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
            // 🔥 Convertir name y description a JSON (como en PostController)
            $nameJson = json_encode(['es' => $request->name], JSON_UNESCAPED_UNICODE);
            $descJson = json_encode(['es' => $request->description], JSON_UNESCAPED_UNICODE);

            $newProduct = Product::create([
                'user_id' => $request->user()->id,
                'name' => $nameJson,
                'category_id' => $request->category_id,
                'description' => $descJson,
                'price' => $request->price,
                'stock_quantity' => $request->stock_quantity,
                'status' => $status,
                'product_type' => $request->input('product_type', 'physical'),
            ]);

            if ($request->hasFile('images')) {
                foreach ($request->file('images') as $index => $file) {
                    $url = $this->uploadImageToCloud($file, 'popayan/products');
                    if ($index === 0) $newProduct->update(['main_image' => $url]);
                    $newProduct->productImages()->create([
                        'image_path' => $url,
                        'sort_order' => $index,
                        'is_primary' => $index === 0,
                    ]);
                }
            }
            return $newProduct;
        });

        return $this->sendResponse(new ProductResource($product->load(['productImages', 'user', 'category'])), 'Activo y galería forjados.', 201);
    }

    public function update(UpdateProductRequest $request, $id): JsonResponse
    {
        $product = Product::findOrFail($id);
        if ($product->user_id !== $request->user()->id) return $this->sendError('No autorizado.', [], 403);

        $data = $request->validated();

        // 🔥 Convertir a JSON si se actualizan name o description
        if (isset($data['name'])) {
            $data['name'] = json_encode(['es' => $data['name']], JSON_UNESCAPED_UNICODE);
        }
        if (isset($data['description'])) {
            $data['description'] = json_encode(['es' => $data['description']], JSON_UNESCAPED_UNICODE);
        }

        if (isset($data['status']) || isset($data['stock_quantity'])) {
            $data['status'] = $this->mapStatus(
                $data['status'] ?? $product->status,
                $data['stock_quantity'] ?? $product->stock_quantity
            );
        }

        if ($request->hasFile('images')) {
            $product->productImages()->delete();
            foreach ($request->file('images') as $index => $file) {
                $url = $this->uploadImageToCloud($file, 'popayan/products');
                if ($index === 0) $data['main_image'] = $url; 
                $product->productImages()->create([
                    'image_path' => $url,
                    'sort_order' => $index,
                    'is_primary' => $index === 0,
                ]);
            }
        }

        $product->update($data);
        return $this->sendResponse(new ProductResource($product->load(['productImages', 'user', 'category'])), 'Producto refinado.');
    }

    public function destroy(Request $request, $id): JsonResponse
    {
        $product = Product::findOrFail($id);
        if ($product->user_id !== $request->user()->id) return $this->sendError('No autorizado.', [], 403);
        $product->delete();
        return $this->sendResponse([], 'Activo erradicado.');
    }

    /**
     * Mapea el estado del producto según stock y estado enviado.
     * Estados finales: available, sold_out, paused
     */
    private function mapStatus($status, $stock)
    {
        if ($stock <= 0) return 'sold_out';
        if ($status === 'published' || $status === 'available') return 'available';
        if ($status === 'draft' || $status === 'paused') return 'paused';
        return 'available';
    }
}