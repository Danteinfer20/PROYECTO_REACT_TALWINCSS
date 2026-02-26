<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/**
 * 📂 IMPORTACIÓN DE CONTROLADORES DESDE LA CARPETA API
 * Asegúrate de que todos estos archivos tengan: namespace App\Http\Controllers\Api;
 */
use App\Http\Controllers\Api\PostController;
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

    // --- 🌐 RUTAS PÚBLICAS ---
    // Obras
    Route::get('/posts', [PostController::class, 'index']);
    Route::get('/posts/{post}', [PostController::class, 'show']);

    // Eventos
    Route::get('/events', [EventController::class, 'index']);
    Route::get('/locations', [EventController::class, 'locations']);

    // Auth
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);


    // --- 🔒 RUTAS PROTEGIDAS (Requieren Token Sanctum) ---
    Route::middleware('auth:sanctum')->group(function () {
        
        // 👤 1. PERFIL (Tabla: users)
        Route::get('/profile', [AuthController::class, 'profile']);
        Route::post('/profile/update', [AuthController::class, 'updateProfile']);
        Route::post('/profile/settings', [AuthController::class, 'updateSettings']);

        // 🎨 2. OBRAS (Tabla: posts)
        Route::post('/posts', [PostController::class, 'store']);
        Route::put('/posts/{post}', [PostController::class, 'update']);
        Route::delete('/posts/{post}', [PostController::class, 'destroy']);
        Route::post('/posts/{post}/media', [PostController::class, 'uploadMedia']);

        // 🔔 3. NOTIFICACIONES (Tabla: notifications)
        Route::get('/notifications', [NotificationController::class, 'index']);
        Route::patch('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
        Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);

        // ❤️ 4. INTERACCIÓN (Tabla: reactions, comments, follows)
        Route::post('/reactions/toggle', [ReactionController::class, 'toggle']);
        Route::post('/comments', [PostController::class, 'storeComment']);
        Route::post('/follow/{user}', [FollowController::class, 'toggle']);

        // 💾 5. FAVORITOS (Tabla: saved_items)
        Route::get('/saved-items', [SavedItemController::class, 'index']);
        Route::post('/saved-items/toggle', [SavedItemController::class, 'toggle']);

        // 🛒 6. TIENDA (Tabla: products, orders)
        Route::get('/products', [PostController::class, 'productsIndex']);
        Route::post('/orders', [OrderController::class, 'store']);
        Route::get('/my-purchases', [OrderController::class, 'myOrders']);
        Route::get('/my-sales', [OrderController::class, 'mySales']);

        // 📅 7. EVENTOS (Tabla: events, attendance)
        Route::post('/events', [EventController::class, 'store']);
        Route::delete('/events/{event}', [EventController::class, 'destroy']);
        Route::post('/events/{event}/rsvp', [EventController::class, 'confirmAttendance']);

        // 📊 8. STATS (Tabla: user_statistics)
        Route::get('/my-statistics', [AuthController::class, 'getStats']);

        // 🚪 LOGOUT
        Route::post('/logout', [AuthController::class, 'logout']);
    });
});