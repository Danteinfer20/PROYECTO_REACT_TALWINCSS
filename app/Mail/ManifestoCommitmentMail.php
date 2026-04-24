<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use App\Models\User;

class ManifestoCommitmentMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public $user;

    /**
     * Inyectamos al usuario que acaba de firmar el manifiesto
     */
    public function __construct(User $user)
    {
        $this->user = $user;
    }

    /**
     * Configuramos el sobre del correo (Asunto)
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Copia Legal: Tu Pacto con Popayán Cultural',
        );
    }

    /**
     * Definimos qué vista Blade se usará
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.manifesto_commitment',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}