<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreEventRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'title'         => 'required|string|max:200',
            'content'       => 'required|string',
            'location_id'   => 'required|exists:locations,id',
            'event_type'    => 'required|in:free,paid,donation',
            'start_date'    => 'required|date|after_or_equal:today',
            'end_date'      => 'required|date|after_or_equal:start_date',
            'price'         => 'nullable|numeric|min:0',
            'requires_rsvp' => 'required|boolean',
            'max_capacity'  => 'required_if:requires_rsvp,1|nullable|integer|min:1',
            'image'         => 'required|image|mimes:jpeg,png,jpg,webp|max:5120',
        ];
    }

    public function messages(): array
    {
        return [
            'image.required'         => 'El Flyer del evento es obligatorio para la cartelera.',
            'image.image'            => 'El Flyer debe ser un archivo de imagen válido.',
            'image.max'              => 'El Flyer excede el peso permitido. Límite: 5MB.',
            'start_date.after_or_equal'=> 'La fecha de inicio no puede estar en el pasado.',
            'end_date.after_or_equal'=> 'La fecha de finalización no puede ser anterior al inicio.',
            'max_capacity.required_if'=> 'Debes definir un Aforo Máximo si habilitas los Tickets QR.',
            'event_type.in'          => 'El tipo de evento debe ser: Libre, Pago o Donación.',
        ];
    }
}