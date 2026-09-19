<?php

namespace App\Exceptions;

use Exception;

/**
 * Excepción cuyo mensaje SÍ está escrito para que lo lea el usuario final.
 *
 * Existe para poder distinguirla de una falla técnica. El catch de un controlador
 * devuelve el mensaje de ésta tal cual ("El evento ha alcanzado su aforo máximo"),
 * mientras que a una \Exception cualquiera la registra en el log y responde algo
 * genérico — el detalle de un error de base de datos no se le muestra a nadie.
 *
 * Regla: si el texto no está pensado para leerse en pantalla, no va acá.
 */
class ReglaNegocioException extends Exception
{
    /**
     * Código HTTP con el que responder. 409 (conflicto) es el correcto para
     * "la regla se cumplió pero el estado del recurso no lo permite":
     * sin stock, sin aforo, orden ya procesada.
     */
    protected int $codigoHttp;

    public function __construct(string $message, int $codigoHttp = 409)
    {
        parent::__construct($message);
        $this->codigoHttp = $codigoHttp;
    }

    public function codigoHttp(): int
    {
        return $this->codigoHttp;
    }
}
