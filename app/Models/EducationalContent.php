<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EducationalContent extends Model
{
    protected $fillable = ['post_id', 'content_type', 'difficulty_level', 'video_url'];

    public function post() {
        return $this->belongsTo(Post::class);
}
}
