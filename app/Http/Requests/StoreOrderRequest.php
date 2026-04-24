<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        // En nuestro modelo P2P, permitimos compras a invitados (guest) o usuarios logueados
        return true; 
    }

    public function rules(): array
    {
        return [
            'items'            => 'required|array|min:1',
            'items.*.id'       => 'required|integer|exists:products,id',
            'items.*.cantidad' => 'required|integer|min:1',
        ];
    }

    public function messages(): array
    {
        return [
            'items.required'      => 'El carrito no puede estar vacío.',
            'items.*.id.exists'   => 'Uno de los productos seleccionados ya no existe en la galería.',
            'items.*.cantidad.min'=> 'La cantidad mínima por producto es 1.',
        ];
    }
}