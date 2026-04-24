<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Importación de Controladores Base
use App\Http\Controllers\Api\PostController;
use App\Http\Controllers\Api\ProductController; 
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserController; 
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\ReactionController;
use App\Http\Controllers\Api\SavedItemController;
use App\Http\Controllers\Api\FollowController;
use App\Http\Controllers\Api\OrderController; 
use App\Http\Controllers\Api\EventController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\CommentController;
use App\Http\Controllers\Api\ArtistController;
use App\Http\Controllers\Api\EducationalContentController;

// Controladores de Catálogos
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\ContentTypeController;

// Controlador de Solicitudes de Creadores
use App\Http\Controllers\Api\CreatorApplicationController;

// Controladores de Dashboards
use App\Http\Controllers\Api\VisitorDashboardController;
use App\Http\Controllers\Api\AdminDashboardController; 
use App\Http\Controllers\Api\ArtistDashboardController;

/*
|--------------------------------------------------------------------------
| API Routes - Plataforma Cultural Popayán (V1) - ARQUITECTURA PRO
|--------------------------------------------------------------------------
*/

Route::prefix('v1')->group(function () {

    // ==========================================
    // 🌐 1. RUTAS PÚBLICAS (Visitantes anónimos)
    // ==========================================
    Route::get('/categories', [CategoryController::class, 'index']); 
    Route::get('/content-types', [ContentTypeController::class, 'index']);
    
    Route::get('/artists', [ArtistController::class, 'index']);
    Route::get('/artists/{username}', [ArtistController::class, 'show']); 
    Route::get('/users/{username}', [UserController::class, 'show']); 
    Route::get('/posts', [PostController::class, 'index']); 
    Route::get('/posts/{identifier}', [PostController::class, 'show']); 
    Route::post('/posts/{id}/share', [PostController::class, 'incrementShare']); 
    Route::get('/products', [ProductController::class, 'index']); 
    Route::get('/products/{product}', [ProductController::class, 'show']); 
    Route::get('/locations', [EventController::class, 'locations']); 
    Route::get('/events', [EventController::class, 'index']); 
    Route::get('/events/{id}', [EventController::class, 'show']); 
    Route::get('/education', [EducationalContentController::class, 'index']); 
    Route::get('/education/{id}', [EducationalContentController::class, 'show']);
    Route::post('/register', [AuthController::class, 'register']); 
    Route::post('/login', [AuthController::class, 'login']); 

    // ==========================================
    // 🔒 2. RUTAS PROTEGIDAS (Usuarios Logueados)
    // ==========================================
    Route::middleware('auth:sanctum')->group(function () {
        
        Route::get('/visitor/dashboard', [VisitorDashboardController::class, 'index']);
        
        Route::get('/profile', [AuthController::class, 'profile']); 
        Route::post('/profile/update', [ProfileController::class, 'update']); 
        Route::post('/profile/settings', [ProfileController::class, 'updateSettings']); 
        Route::get('/my-statistics', [AuthController::class, 'getStats']); 
        Route::post('/logout', [AuthController::class, 'logout']); 

        Route::post('/orders', [OrderController::class, 'store']); 
        Route::get('/my-purchases', [OrderController::class, 'myOrders']); 

        Route::post('/events/{id}/attend', [EventController::class, 'attend']); 

        Route::post('/reactions/toggle', [ReactionController::class, 'toggle']); 
        Route::post('/saved-items/toggle', [SavedItemController::class, 'toggle']); 
        Route::get('/saved-items', [SavedItemController::class, 'index']); 
        Route::post('/comments', [CommentController::class, 'store']);
        
        Route::post('/follow/{id}', [FollowController::class, 'toggle']); 

        Route::get('/notifications', [NotificationController::class, 'index']); 
        Route::patch('/notifications/{id}/read', [NotificationController::class, 'markAsRead']); 
        Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsRead']); 

        Route::post('/creator-applications', [CreatorApplicationController::class, 'store']);
        
        // ==========================================
        // 🛡️ 3. RUTAS DE CREADORES VERIFICADOS (Gestores / Artesanos / Educadores)
        // ==========================================
        Route::middleware('verified_creator')->group(function () {
            
            // Taller Creativo
            Route::get('/artist/dashboard', [ArtistDashboardController::class, 'index']);

            // Gestión de Catálogos (Transacciones)
            Route::apiResource('posts', PostController::class)->except(['index', 'show']);
            Route::apiResource('products', ProductController::class)->except(['index', 'show']);
            Route::apiResource('events', EventController::class)->except(['index', 'show']);
            Route::apiResource('education', EducationalContentController::class)->except(['index', 'show']); 

            // 🔥 LOGÍSTICA P2P DEL ARTESANO
            Route::get('/my-sales', [OrderController::class, 'mySales']); 
            Route::patch('/orders/{order}/status', [OrderController::class, 'updateStatus']);
            
            // 🚀 NUEVA RUTA: El gatillo financiero del modelo P2P
            Route::put('/orders/{id}/confirm', [OrderController::class, 'confirmPayment']);
        });

        // ==========================================
        // 👑 4. RUTAS DE ADMINISTRACIÓN (Dashboard Admin)
        // ==========================================
        Route::middleware('admin')->prefix('admin')->group(function () {
            Route::get('/dashboard', [AdminDashboardController::class, 'index']);
            Route::get('/users', [AdminDashboardController::class, 'getUsers']); 
            Route::patch('/users/{id}/approve', [AdminDashboardController::class, 'approveCreator']); 
            Route::patch('/users/{id}/status', [AdminDashboardController::class, 'updateUserStatus']); 
        });
    });
});