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
use Illuminate\Http\Request; // Añadido para el nuevo método

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
            $buyerId = $user ? $user->id : User::first()->id ?? null; 
            
            if (!$buyerId) {
                throw new \Exception("No hay usuarios registrados en el sistema para asociar la compra.");
            }

            $realTotalAmount = 0;
            $orderItemsData = [];

            // 1. VERIFICACIÓN DE DISPONIBILIDAD (Solo verifica, NO descuenta stock)
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

            // 2. CREACIÓN DE LA ORDEN (Nace como Pendiente, sin afectar finanzas)
            $order = new Order();
            $order->user_id       = $buyerId;
            $order->order_number  = 'POP-' . strtoupper(substr(uniqid(), -6));
            $order->total_amount  = $realTotalAmount;
            $order->status        = 'pending';
            $order->contact_phone = $user->phone ?? 'Venta P2P';
            $order->save();

            // 3. INSERCIÓN DEL DETALLE DE COMPRA
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
    // 💰 FASE 2: LA EJECUCIÓN FINANCIERA (Lado del Artesano)
    // ==========================================
    public function confirmPayment(Request $request, $id): JsonResponse
    {
        try {
            DB::beginTransaction();

            $order = Order::with('orderItems.product')->findOrFail($id);

            // Blindaje 1: Evitar doble cobro
            if ($order->status !== 'pending') {
                throw new \Exception("Esta orden ya ha sido procesada o cancelada.");
            }

            $artisansToUpdate = [];

            // 1. DESCONTAR STOCK Y SUMAR GANANCIAS AHORA SÍ
            foreach ($order->orderItems as $item) {
                $product = Product::lockForUpdate()->find($item->product_id);

                // Blindaje 2: ¿Se agotó mientras estaba pendiente el pago por WhatsApp?
                if ($product->stock_quantity < $item->quantity) {
                    throw new \Exception("Anomalía: El producto '{$product->name}' se ha agotado mientras se esperaba el pago. Venta abortada.");
                }

                // Descontar inventario físico
                $product->decrement('stock_quantity', $item->quantity);
                $product->increment('sales_count', $item->quantity);

                // Preparar la inyección de ingresos para el artesano
                $artisanId = $product->user_id;
                if (!isset($artisansToUpdate[$artisanId])) {
                    $artisansToUpdate[$artisanId] = ['sales' => 0, 'revenue' => 0];
                }
                $artisansToUpdate[$artisanId]['sales'] += $item->quantity;
                $artisansToUpdate[$artisanId]['revenue'] += $item->subtotal;
            }

            // 2. ACTUALIZAR ESTADÍSTICAS OFICIALES DEL ARTESANO
            foreach ($artisansToUpdate as $artId => $stats) {
                $userStat = UserStatistic::firstOrCreate(
                    ['user_id' => $artId],
                    ['sales_count' => 0, 'total_revenue' => 0]
                );
                
                $userStat->increment('sales_count', $stats['sales']);
                $userStat->total_revenue += $stats['revenue'];
                $userStat->save();
            }

            // 3. CAMBIAR ESTADO A CONFIRMADO
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
}