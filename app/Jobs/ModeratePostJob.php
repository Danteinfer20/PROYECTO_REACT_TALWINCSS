<?php

namespace App\Jobs;

use App\Models\Post;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use OpenAI\Laravel\Facades\OpenAI;

class ModeratePostJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, SerializesModels;

    public $post;

    public function __construct(Post $post)
    {
        $this->post = $post;
    }

    public function handle(): void
    {
        // Solo moderar si está pendiente
        if ($this->post->moderation_status !== 'pending') {
            return;
        }

        $textToModerate = $this->post->title . "\n" . $this->post->content;

        try {
            $result = OpenAI::moderations()->create([
                'model' => 'text-moderation-latest',
                'input' => $textToModerate,
            ]);

            $aiResult = $result->results[0];
            $isFlagged = $aiResult->flagged;
            $categories = $aiResult->categories;

            $status = $isFlagged ? 'manual_review' : 'approved';

            $this->post->update([
                'moderation_status' => $status,
                'ai_moderation_result' => [
                    'flagged' => $isFlagged,
                    'categories' => (array) $categories,
                    'moderated_at' => now(),
                ],
            ]);

            // Si el contenido es seguro y está publicado, cambiar status a 'published'
            if (!$isFlagged && $this->post->status === 'draft') {
                $this->post->update(['status' => 'published', 'published_at' => now()]);
            }

        } catch (\Exception $e) {
            // Log error, opcionalmente marcar como manual_review por seguridad
            $this->post->update([
                'moderation_status' => 'manual_review',
                'moderation_notes' => 'Error en IA: ' . $e->getMessage(),
            ]);
        }
    }
}