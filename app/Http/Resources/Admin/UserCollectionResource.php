<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserCollectionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'username' => $this->username,
            'email' => $this->email,
            'user_type' => $this->user_type,
            'status' => $this->status,
            'profile_picture' => $this->profile_picture,
            'created_at' => $this->created_at->toIso8601String(),
        ];
    }
}