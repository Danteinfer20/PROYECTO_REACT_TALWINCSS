<?php

namespace App\Http\Controllers\Api;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\UserStatistic;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use App\Http\Requests\StoreOrderRequest;
use App\Http\Resources\OrderResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrderController extends BaseController 
{
    // ==========================================
    // 🛒 FASE 1: LA RESERVA (Lado del Comprador)
    // ==========================================
    public function store(StoreOrderRequest $request): JsonResponse
    {
        try {
            DB::beginTransaction();

            $user = auth('sanctum')->user();
            
            // 🛡️ BLINDAJE DE IDENTIDAD: Eliminamos el fallback peligroso de User::first()
            // Si el usuario no está autenticado, la transacción debe ser rechazada.
            if (!$user) {
                return $this->sendError('Sesión no identificada.', ['error' => 'Debes estar autenticado para realizar una compra.'], 401);
            }

            $buyerId = $user->id; 

            $realTotalAmount = 0;
            $orderItemsData = [];

            // 1. VERIFICACIÓN DE DISPONIBILIDAD
            foreach ($request->items as $item) {
                $product = Product::lockForUpdate()->find($item['id']);

                if (!$product || $product->stock_quantity < $item['cantidad']) {
                    throw new \Exception("Stock insuficiente para el producto: " . ($product ? $product->name : 'ID ' . $item['id']));
                }

                $price = $product->sale_price ?? $product->price;
                $subtotal = $price * $item['cantidad'];
                $realTotalAmount += $subtotal;

                $orderItemsData[] = [
                    'product_model' => $product,
                    'quantity'      => $item['cantidad'],
                    'unit_price'    => $price,
                    'subtotal'      => $subtotal
                ];
            }

            // 2. CREACIÓN DE LA ORDEN
            $order = new Order();
            $order->user_id       = $buyerId;
            $order->order_number  = 'POP-' . strtoupper(substr(uniqid(), -6));
            $order->total_amount  = $realTotalAmount;
            $order->status        = 'pending';
            $order->contact_phone = $user->phone ?? 'Venta P2P';
            $order->save();

            // 3. INSERCIÓN DEL DETALLE
            foreach ($orderItemsData as $data) {
                $orderItem = new OrderItem();
                $orderItem->order_id   = $order->id;
                $orderItem->product_id = $data['product_model']->id;
                $orderItem->quantity   = $data['quantity'];
                $orderItem->unit_price = $data['unit_price'];
                $orderItem->subtotal   = $data['subtotal'];
                $orderItem->save();
            }

            DB::commit();

            $order->load(['orderItems.product', 'user']);

            return $this->sendResponse(
                new OrderResource($order), 
                'Reserva generada con éxito. Esperando confirmación de pago del Artesano.'
            );

        } catch (\Exception $e) {
            DB::rollBack();
            return $this->sendError('Transacción denegada.', ['error' => $e->getMessage()], 400);
        }
    }

    // ==========================================
    // 💰 FASE 2: LA EJECUCIÓN FINANCIERA (Lado del Vendedor)
    // ==========================================
    public function confirmPayment(Request $request, $id): JsonResponse
    {
        try {
            DB::beginTransaction();

            $order = Order::with('orderItems.product')->findOrFail($id);

            if ($order->status !== 'pending') {
                throw new \Exception("Esta orden ya ha sido procesada o cancelada.");
            }

            $artisansToUpdate = [];

            // 1. DESCONTAR STOCK Y SUMAR GANANCIAS
            foreach ($order->orderItems as $item) {
                $product = Product::lockForUpdate()->find($item->product_id);

                if ($product->stock_quantity < $item->quantity) {
                    throw new \Exception("Anomalía: El producto '{$product->name}' se ha agotado. Venta abortada.");
                }

                $product->decrement('stock_quantity', $item->quantity);
                $product->increment('sales_count', $item->quantity);

                $artisanId = $product->user_id;
                if (!isset($artisansToUpdate[$artisanId])) {
                    $artisansToUpdate[$artisanId] = ['sales' => 0, 'revenue' => 0];
                }
                $artisansToUpdate[$artisanId]['sales'] += $item->quantity;
                $artisansToUpdate[$artisanId]['revenue'] += $item->subtotal;
            }

            // 2. ACTUALIZAR ESTADÍSTICAS
            foreach ($artisansToUpdate as $artId => $stats) {
                $userStat = UserStatistic::firstOrCreate(
                    ['user_id' => $artId],
                    ['sales_count' => 0, 'total_revenue' => 0]
                );
                
                $userStat->increment('sales_count', $stats['sales']);
                $userStat->total_revenue += $stats['revenue'];
                $userStat->save();
            }

            $order->status = 'confirmed'; 
            $order->save();

            DB::commit();

            return $this->sendResponse(
                new OrderResource($order), 
                'Pago confirmado. Stock descontado y métricas financieras en verde.'
            );

        } catch (\Exception $e) {
            DB::rollBack();
            return $this->sendError('Error en la confirmación de la venta.', ['error' => $e->getMessage()], 400);
        }
    }

    // ==========================================
    // 🏛️ FASE 3: EL ARCHIVO DEL CIUDADANO (Compras)
    // ==========================================
    public function myOrders(Request $request): JsonResponse
    {
        $user = auth('sanctum')->user();
        
        if (!$user) {
            return $this->sendError('Sesión no válida.', [], 401);
        }

        // Recuperamos sus órdenes con el detalle de productos
        $orders = Order::where('user_id', $user->id)
            ->with(['orderItems.product'])
            ->latest()
            ->get();

        return $this->sendResponse(
            OrderResource::collection($orders), 
            'Historial de adquisiciones recuperado.'
        );
    }

    // ==========================================
    // 📊 FASE 4: LA VISIÓN DEL VENDEDOR (Ventas)
    // ==========================================
    public function mySales(Request $request): JsonResponse
    {
        $user = auth('sanctum')->user();
        
        if (!$user || !in_array($user->user_type, ['artist', 'cultural_manager'])) {
            return $this->sendError('Acceso denegado. Área exclusiva para Creadores Verificados.', [], 403);
        }

        $orders = Order::whereHas('orderItems.product', function ($query) use ($user) {
            $query->where('user_id', $user->id);
        })
        ->with(['user', 'orderItems' => function ($query) use ($user) {
            $query->whereHas('product', function ($subQuery) use ($user) {
                $subQuery->where('user_id', $user->id);
            })->with('product');
        }])
        ->latest()
        ->get();

        return $this->sendResponse(OrderResource::collection($orders), 'Panel logístico sincronizado.');
    }
}