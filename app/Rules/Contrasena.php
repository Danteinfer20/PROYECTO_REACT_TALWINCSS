<?php

namespace App\Rules;

use Illuminate\Validation\Rules\Password;

/**
 * La única definición de qué es una contraseña aceptable.
 *
 * Estaba escrita en dos lugares —el registro y el restablecimiento— como
 * `min:8`. Dos copias de la misma regla es como terminan diciendo cosas
 * distintas: se endurece una, se olvida la otra, y queda una puerta floja.
 */
class Contrasena
{
    /**
     * El criterio: longitud y comprobación contra filtraciones conocidas,
     * NO un catálogo de símbolos obligatorios.
     *
     * Exigir mayúscula + número + símbolo suena más seguro y en la práctica
     * empuja a todo el mundo al mismo patrón previsible ("Popayan2026!"), que
     * es justo lo que los diccionarios de ataque prueban primero. Una frase
     * larga resiste más y se recuerda mejor.
     *
     * 🔎 `uncompromised()` compara contra la base de contraseñas filtradas de
     * Have I Been Pwned, y lo hace sin mandar la contraseña: calcula su hash
     * SHA-1, envía los primeros 5 caracteres, y compara el resto localmente
     * entre los cientos de resultados que vuelven (k-anonimato). Si el servicio
     * no responde, la validación deja pasar — nunca bloquea un registro por una
     * caída de red ajena.
     */
    public static function reglas(): array
    {
        return [
            'required',
            'string',
            'confirmed',
            Password::min(10)
                ->letters()
                ->numbers()
                ->uncompromised(),
        ];
    }

    /**
     * Los mensajes, en castellano y explicando qué hacer.
     *
     * 🚨 Sin esto el usuario ve la clave de traducción cruda en la pantalla:
     * literalmente «validation.password.uncompromised». El proyecto no tiene
     * archivos de traducción de validación, así que Laravel devuelve la clave
     * cuando no encuentra el texto. Comprobado pidiéndole un registro con una
     * contraseña filtrada.
     *
     * Se usa con `array_merge(Contrasena::mensajes(), [...])` en cada Request.
     */
    public static function mensajes(string $campo = 'password'): array
    {
        return [
            "{$campo}.required" => 'Falta la contraseña.',
            "{$campo}.confirmed" => 'Las dos contraseñas no coinciden.',
            "{$campo}.min" => 'La contraseña necesita al menos 10 caracteres. Una frase que recuerdes sirve mejor —y es más segura— que una palabra corta con símbolos.',
            "{$campo}.letters" => 'La contraseña tiene que incluir alguna letra.',
            "{$campo}.numbers" => 'La contraseña tiene que incluir algún número.',
            "{$campo}.uncompromised" => 'Esa contraseña aparece en filtraciones públicas de otros sitios, así que ya está en las listas que se prueban primero. Elegí otra.',
        ];
    }
}
