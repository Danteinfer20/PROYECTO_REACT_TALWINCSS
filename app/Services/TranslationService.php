<?php

namespace App\Services;

use Stichoza\GoogleTranslate\GoogleTranslate;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Throwable; // 🔥 Importación crítica para interceptar errores fatales

class TranslationService
{
    /**
     * Traduce texto con memoria caché para evitar latencia y consumo de API.
     */
    public static function translate(string $text, string $targetLang): string
    {
        if ($targetLang === 'es' || empty(trim($text))) {
            return $text;
        }

        $cacheKey = 'trans_' . md5($text) . '_' . $targetLang;

        return Cache::remember($cacheKey, now()->addDay(), function () use ($text, $targetLang) {
            try {
                $tr = new GoogleTranslate();
                $tr->setSource('es');
                $tr->setTarget($targetLang);
                
                return $tr->translate($text);
            } catch (Throwable $e) { 
                // 🔥 BLINDAJE ABSOLUTO: Atrapa caídas de red, excepciones y falta de clases.
                Log::error("Fallo estructural en TranslationService: " . $e->getMessage());
                return $text; // Retorno seguro. Jamás enviará un Error 500 al frontend.
            }
        });
    }
}