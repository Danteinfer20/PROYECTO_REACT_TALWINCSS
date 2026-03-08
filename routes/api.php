<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/**
 * 📂 IMPORTACIÓN DE CONTROLADORES
 */
use App\Http\Controllers\Api\PostController;
use App\Http\Controllers\Api\ProductController; // ✅ Nuevo: Para la tienda
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\ReactionController;
use App\Http\Controllers\Api\SavedItemController;
use App\Http\Controllers\Api\FollowController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\EventController; 

/*
|--------------------------------------------------------------------------
| API Routes - Plataforma Cultural Popayán (V1)
|--------------------------------------------------------------------------
*/

Route::prefix('v1')->group(function () {

    // ==========================================
    // 🌐 RUTAS PÚBLICAS (Visitantes)
    // ==========================================
    
    // Obras y Arte
    Route::get('/posts', [PostController::class, 'index']);
    Route::get('/posts/{post}', [PostController::class, 'show']);

    // Tienda / Productos
    Route::get('/products', [ProductController::class, 'index']); // Lista pública de productos
    Route::get('/products/{product}', [ProductController::class, 'show']);

    // Eventos y Agenda
    Route::get('/events', [EventController::class, 'index']);
    Route::get('/locations', [EventController::class, 'locations']);

    // Autenticación Inicial
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);


    // ==========================================
    // 🔒 RUTAS PROTEGIDAS (Sanctum)
    // ==========================================
    Route::middleware('auth:sanctum')->group(function () {
        
        // 👤 1. PERFIL Y AJUSTES
        Route::get('/profile', [AuthController::class, 'profile']);
        Route::post('/profile/update', [AuthController::class, 'updateProfile']);
        Route::post('/profile/settings', [AuthController::class, 'updateSettings']);
        Route::get('/my-statistics', [AuthController::class, 'getStats']);

        // 🎨 2. GESTIÓN DE OBRAS (Artistas)
        Route::post('/posts', [PostController::class, 'store']);
        Route::put('/posts/{post}', [PostController::class, 'update']);
        Route::delete('/posts/{post}', [PostController::class, 'destroy']);

        // 🛒 3. TIENDA Y VENTAS (Artistas/Gestores)
        Route::post('/products', [ProductController::class, 'store']); // Crear producto
        Route::put('/products/{product}', [ProductController::class, 'update']); // Editar producto
        Route::delete('/products/{product}', [ProductController::class, 'destroy']); // Borrar producto
        Route::get('/my-sales', [OrderController::class, 'mySales']); // Lo que he vendido
        Route::get('/my-purchases', [OrderController::class, 'myOrders']); // Lo que he comprado
        Route::post('/orders', [OrderController::class, 'store']); // Realizar compra

        // 📅 4. AGENDA CULTURAL (Gestores)
        Route::post('/events', [EventController::class, 'store']);
        Route::put('/events/{event}', [EventController::class, 'update']);
        Route::delete('/events/{event}', [EventController::class, 'destroy']);
        Route::post('/events/{event}/rsvp', [EventController::class, 'confirmAttendance']);

        // ❤️ 5. INTERACCIÓN Y SOCIAL
        Route::post('/reactions/toggle', [ReactionController::class, 'toggle']);
        Route::post('/comments', [PostController::class, 'storeComment']);
        Route::post('/follow/{user}', [FollowController::class, 'toggle']);
        Route::get('/saved-items', [SavedItemController::class, 'index']);
        Route::post('/saved-items/toggle', [SavedItemController::class, 'toggle']);

        // 🔔 6. NOTIFICACIONES
        Route::get('/notifications', [NotificationController::class, 'index']);
        Route::patch('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
        Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);

        // 🚪 LOGOUT
        Route::post('/logout', [AuthController::class, 'logout']);
    });
});