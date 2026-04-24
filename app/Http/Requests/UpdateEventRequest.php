<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateEventRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'title'         => 'sometimes|required|string|max:200',
            'content'       => 'sometimes|required|string',
            'location_id'   => 'sometimes|required|exists:locations,id',
            'event_type'    => 'sometimes|required|in:free,paid,donation',
            'start_date'    => 'sometimes|required|date',
            'end_date'      => 'sometimes|required|date|after_or_equal:start_date',
            'price'         => 'nullable|numeric|min:0',
            'requires_rsvp' => 'sometimes|required|boolean',
            'max_capacity'  => 'required_if:requires_rsvp,1|nullable|integer|min:1',
            'image'         => 'nullable|image|mimes:jpeg,png,jpg,webp|max:5120',
        ];
    }

    public function messages(): array
    {
        return [
            'image.image'            => 'El Flyer debe ser un archivo de imagen válido.',
            'image.max'              => 'El Flyer excede el peso permitido. Límite: 5MB.',
            'end_date.after_or_equal'=> 'La fecha de finalización no puede ser anterior al inicio.',
            'max_capacity.required_if'=> 'Debes definir un Aforo Máximo si habilitas los Tickets QR.',
        ];
    }
}