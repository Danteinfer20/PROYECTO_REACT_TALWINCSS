<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Follow;
use App\Models\UserStatistic;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\JsonResponse;

class FollowController extends Controller
{
    /**
     * Alterna el estado de seguimiento (Follow / Unfollow) de manera magistral.
     */
    public function toggle(Request $request, $id): JsonResponse
    {
        try {
            $follower = $request->user();
            
            // Localizamos al artista por ID
            $following = User::findOrFail($id);

            // 🛑 Regla de Oro: No puedes seguirte a ti mismo
            if ($follower->id === $following->id) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Operación inválida: No puedes forjar un vínculo contigo mismo.'
                ], 400);
            }

            $statusMessage = '';

            // 🛡️ Transacción ACID: Consistencia absoluta en la base de datos
            DB::transaction(function () use ($follower, $following, &$statusMessage) {
                
                $existingFollow = Follow::where('follower_id', $follower->id)
                                        ->where('following_id', $following->id)
                                        ->first();

                $followingStats = UserStatistic::firstOrCreate(['user_id' => $following->id]);
                $followerStats = UserStatistic::firstOrCreate(['user_id' => $follower->id]);

                if ($existingFollow) {
                    // 🔥 ACCIÓN: Disolución del vínculo (Unfollow)
                    $existingFollow->delete();
                    
                    if ($followingStats->follower_count > 0) $followingStats->decrement('follower_count');
                    if ($followerStats->following_count > 0) $followerStats->decrement('following_count');
                    
                    $statusMessage = 'Successfully unfollowed';
                } else {
                    // 🌟 ACCIÓN: Forja del vínculo (Follow)
                    Follow::create([
                        'follower_id' => $follower->id,
                        'following_id' => $following->id,
                        'notifications_enabled' => true
                    ]);

                    $followingStats->increment('follower_count');
                    $followerStats->increment('following_count');

                    $statusMessage = 'Successfully followed';
                }
            });

            return response()->json([
                'status' => 'success',
                'message' => $statusMessage,
                'data' => [
                    'current_followers' => UserStatistic::where('user_id', $following->id)->value('follower_count')
                ]
            ], 200);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'El artista no existe en nuestros registros.'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Fallo crítico en la forja: ' . $e->getMessage()
            ], 500);
        }
    }
}