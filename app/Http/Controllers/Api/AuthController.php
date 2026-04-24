<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

// Form Requests y Resources
use App\Http\Requests\RegisterUserRequest;
use App\Http\Resources\UserResource;

class AuthController extends Controller
{
    public function register(RegisterUserRequest $request) 
    {
        // Extraemos la respuesta de la transacción para mantener el código limpio
        $result = DB::transaction(function () use ($request) {
            $data = $request->validated();

            $user = User::create([
                'name'      => $data['name'],
                'username'  => Str::slug($data['name']) . '-' . Str::random(5),
                'email'     => $data['email'],
                'password'  => Hash::make($data['password']),
                'user_type' => $data['user_type'] ?? 'visitor', 
                'status'    => 'active',
                'city'      => 'Popayán',
            ]);

            $user->settings()->create([
                'public_profile'       => true,
                'email_notifications'  => true,
                'nearby_events_notify' => true,
            ]);

            return [
                'user'  => new UserResource($user->load('settings')),
                'token' => $user->createToken('token-popayan')->plainTextToken
            ];
        });

        return response()->json(['status' => 'success'] + $result, 201);
    }

    public function login(Request $request) 
    {
        $validated = $request->validate([
            'email'    => 'required|email', 
            'password' => 'required'
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (!$user || !Hash::check($validated['password'], $user->password)) {
            return response()->json(['status' => 'error', 'message' => 'Credenciales incorrectas'], 401);
        }

        return response()->json([
            'status' => 'success',
            'user'   => new UserResource($user->load('settings')),
            'token'  => $user->createToken('token-popayan')->plainTextToken
        ], 200);
    }

    public function profile() 
    {
        return response()->json([
            'status' => 'success', 
            'user'   => new UserResource(Auth::user()->load('settings'))
        ], 200);
    }

    public function logout(Request $request) 
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['status' => 'success'], 200);
    }

    // ==========================================
    // 🌐 RUTAS PÚBLICAS
    // ==========================================

    public function getArtists() 
    {
        $artists = User::ofType('artist')->active()->get();
                       
        return response()->json([
            'status'  => 'success', 
            'artists' => UserResource::collection($artists)
        ], 200);
    }

    public function getPublicProfile($username) 
    {
        $artist = User::with(['settings', 'posts' => function($q) {
            $q->published()->latest(); 
        }])
        ->where('username', $username)
        ->active() 
        ->firstOrFail(); 

        if ($artist->settings && !$artist->settings->public_profile) {
            return response()->json(['status' => 'error', 'message' => 'Perfil privado'], 403);
        }

        return response()->json([
            'status' => 'success', 
            'artist' => new UserResource($artist) 
        ], 200);
    }
}