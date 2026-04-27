<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Http\Resources\ManagerEventResource;
use Illuminate\Http\Request;

class ManagerEventController extends Controller
{
    public function index()
    {
        $events = Event::with(['post.postMedia', 'location'])
            ->where('organizer_id', auth()->id())
            ->orderBy('start_date', 'asc')
            ->get();

        return response()->json([
            'status' => 'success',
            'data'   => ManagerEventResource::collection($events)
        ], 200);
    }
}