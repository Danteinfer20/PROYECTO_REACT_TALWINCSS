<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB; // Importante para transacciones si decidieras usarlas

class AuthController extends Controller
{
    // 1. REGISTRO
    public function register(Request $request) 
    {
        $fields = $request->validate([
            'name'      => 'required|string|max:150',
            'email'     => 'required|string|email|max:100|unique:users,email',
            'password'  => 'required|string|min:8|confirmed',
            'user_type' => 'required|string|in:artist,cultural_manager,visitor,admin,educator' 
        ]);

        try {
            $user = User::create([
                'name'      => $fields['name'],
                'username'  => Str::slug($fields['name']) . '-' . Str::random(5),
                'email'     => $fields['email'],
                'password'  => Hash::make($fields['password']),
                'user_type' => $fields['user_type'], 
                'status'    => 'active',
                'city'      => 'Popayán',
            ]);

            $token = $user->createToken('token-popayan')->plainTextToken;

            return response()->json([
                'status'  => 'success',
                'user'    => $user,
                'token'   => $token
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Error al crear usuario: ' . $e->getMessage()
            ], 500);
        }
    }

    // 2. LOGIN
    public function login(Request $request) 
    {
        $fields = $request->validate([
            'email'    => 'required|string|email',
            'password' => 'required|string'
        ]);

        $user = User::where('email', $fields['email'])->first();

        if (!$user || !Hash::check($fields['password'], $user->password)) {
            return response()->json(['status' => 'error', 'message' => 'Credenciales incorrectas'], 401);
        }

        // Limpiar tokens anteriores para seguridad
        $user->tokens()->delete();
        $token = $user->createToken('token-popayan')->plainTextToken;

        return response()->json([
            'status'  => 'success',
            'user'    => $user,
            'token'   => $token
        ], 200);
    }

    // 3. PERFIL (GET)
    public function profile(Request $request) 
    {
        $user = Auth::user();
        if (!$user) return response()->json(['message' => 'No autorizado'], 401);

        // Cargamos estadísticas y relaciones necesarias
        $user->loadCount(['posts']); 
        return response()->json(['status' => 'success', 'user' => $user], 200);
    }

    // 4. ACTUALIZACIÓN (VERSIÓN COMPLETA Y CORREGIDA)
    public function updateProfile(Request $request) 
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json(['message' => 'No autorizado'], 401);
        }

        // Validación: Incluimos 'cover_image' que viene de tu React
        $request->validate([
            'name'         => 'nullable|string|max:150',
            'bio'          => 'nullable|string',
            'phone'        => 'nullable|string|max:20',
            'neighborhood' => 'nullable|string|max:100',
            'city'         => 'nullable|string|max:100',
            'website'      => 'nullable|string|max:255',
            'image'        => 'nullable|image|mimes:jpeg,png,jpg,webp|max:5120',      // Foto de Perfil
            'cover_image'  => 'nullable|image|mimes:jpeg,png,jpg,webp|max:5120',      // Foto de Portada
        ]);

        try {
            // --- Actualización de Textos ---
            // Usamos $request->input() para capturar valores aunque sean vacíos (si el usuario borra el texto)
            if ($request->has('name'))         $user->name = $request->input('name');
            if ($request->has('bio'))          $user->bio = $request->input('bio');
            if ($request->has('phone'))        $user->phone = $request->input('phone');
            if ($request->has('neighborhood')) $user->neighborhood = $request->input('neighborhood');
            if ($request->has('city'))         $user->city = $request->input('city');
            if ($request->has('website'))      $user->website = $request->input('website');

            // --- 🖼️ 1. FOTO DE PERFIL ---
            if ($request->hasFile('image')) {
                // Si ya tiene foto, la borramos del disco físico
                if ($user->profile_picture) {
                    // Convertimos la URL completa http://... en ruta relativa profiles/imagen.jpg
                    $oldPath = str_replace(asset('storage/'), '', $user->profile_picture);
                    Storage::disk('public')->delete($oldPath);
                }

                // Guardar nueva
                $path = $request->file('image')->store('profiles', 'public');
                $user->profile_picture = asset('storage/' . $path);
            }

            // --- 🖼️ 2. FOTO DE PORTADA ---
            if ($request->hasFile('cover_image')) {
                // Si ya tiene portada, la borramos
                if ($user->cover_picture) {
                    $oldPathCover = str_replace(asset('storage/'), '', $user->cover_picture);
                    Storage::disk('public')->delete($oldPathCover);
                }

                // Guardar nueva en carpeta 'covers'
                $pathCover = $request->file('cover_image')->store('covers', 'public');
                $user->cover_picture = asset('storage/' . $pathCover);
            }

            // --- Guardado Final ---
            $user->save();

            return response()->json([
                'status'  => 'success',
                'message' => '¡Perfil actualizado permanentemente!',
                // Devolvemos el usuario "fresco" desde la DB para actualizar React
                'user'    => $user->fresh() 
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Error al guardar en el servidor',
                'error'   => $e->getMessage() 
            ], 500);
        }
    }

    // 5. LOGOUT
    public function logout(Request $request) 
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['status' => 'success'], 200);
    }
}