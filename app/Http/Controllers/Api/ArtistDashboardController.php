<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Post;
use App\Models\Product;
use App\Models\UserStatistic;

class ArtistDashboardController extends Controller
{
    /**
     * Extrae las métricas, obras y productos del artista logueado (En Tiempo Real).
     */
    public function index(Request $request)
    {
        try {
            $user = $request->user();

            // 1. CÁLCULOS EN TIEMPO REAL (El motor dinámico)
            $realWorksCount = Post::where('user_id', $user->id)->count();
            
            // Calculamos las ventas sumando el contador de los productos (si existen)
            $realSalesCount = Product::where('user_id', $user->id)->sum('sales_count');

            // 2. SINCRONIZACIÓN SILENCIOSA DE ESTADÍSTICAS
            $stats = UserStatistic::firstOrCreate(
                ['user_id' => $user->id],
                ['post_count' => 0, 'follower_count' => 0, 'sales_count' => 0, 'total_revenue' => 0]
            );

            // Si la base de datos estática está desactualizada, la calibramos en vivo
            if ($stats->post_count !== $realWorksCount || $stats->sales_count !== $realSalesCount) {
                $stats->post_count = $realWorksCount;
                $stats->sales_count = $realSalesCount;
                $stats->save();
            }

            // 3. EMPAQUETADO DE KPIs
            $kpis = [
                'total_works' => $realWorksCount, // 100% Preciso
                'followers'   => $stats->follower_count,
                'sales'       => $realSalesCount,
                'revenue'     => $stats->total_revenue,
            ];

            // 4. EXTRACCIÓN DE OBRAS (Últimas 4 para la galería del dashboard)
            $recentWorks = Post::where('user_id', $user->id)
                                ->select('id', 'title', 'status', 'view_count', 'created_at')
                                ->orderBy('created_at', 'desc')
                                ->take(4)
                                ->get();

            // 5. EXTRACCIÓN DE PRODUCTOS (Últimos 4 activos)
            $activeProducts = Product::where('user_id', $user->id)
                                    ->where('status', 'available')
                                    ->select('id', 'name', 'price', 'stock_quantity', 'sales_count')
                                    ->orderBy('created_at', 'desc')
                                    ->take(4)
                                    ->get();

            // 6. RESPUESTA (Consumida por ArtistDashboard.jsx)
            return response()->json([
                'status' => 'success',
                'data' => [
                    'kpis'            => $kpis,
                    'recent_works'    => $recentWorks,
                    'active_products' => $activeProducts
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Fallo crítico en el núcleo del Taller Creativo: ' . $e->getMessage()
            ], 500);
        }
    }
}