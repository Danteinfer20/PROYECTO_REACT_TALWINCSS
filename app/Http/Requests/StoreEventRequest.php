<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreEventRequest extends FormRequest
{
    /**
     * Determina si el usuario está autorizado para realizar esta solicitud.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Reglas de validación para el forjado de eventos.
     */
    public function rules(): array
    {
        return [
            // 📝 Identidad del Evento
            'title'                => 'required|string|max:200',
            'content'              => 'required|string',
            'category_id'          => 'required|exists:categories,id',

            // 📍 Lógica de Ubicación Híbrida (Referencia Libre vs Catálogo)
            'location_id'          => 'required_without:custom_location_name|nullable|exists:locations,id',
            'custom_location_name' => 'required_without:location_id|nullable|string|max:150',
            'custom_address'       => 'nullable|string|max:255',
            'latitude'             => 'nullable|numeric|between:-90,90',
            'longitude'            => 'nullable|numeric|between:-180,180',

            // 📅 Cronología (Formato Estándar SQL)
            'start_date'           => 'required|date',
            'end_date'             => 'required|date|after_or_equal:start_date',

            // 🎫 Modelo de Negocio y Logística
            'event_type'           => 'required|in:free,paid,donation',
            'price'                => 'required_if:event_type,paid|nullable|numeric|min:0',
            
            // Flexibilidad para recibir booleans como strings desde FormData
            'requires_rsvp'        => 'required', 
            'max_capacity'         => 'required_if:requires_rsvp,1,true,"1","true"|nullable|integer|min:1',

            // 🖼️ Activo Visual Matriz
            'image'                => 'required|image|mimes:jpeg,png,jpg,webp|max:5120',
        ];
    }

    /**
     * Mensajes de error personalizados para el Taller de Creación.
     */
    public function messages(): array
    {
        return [
            'title.required'         => 'Toda creación requiere un título o identificador.',
            'content.required'       => 'El relato cultural o descripción es obligatorio.',
            'category_id.required'   => 'Debes asignar una taxonomía cultural.',
            
            'location_id.required_without' => 'Selecciona un recinto o define una ubicación libre.',
            'custom_location_name.required_without' => 'Es imperativo especificar dónde ocurrirá el evento.',

            'start_date.required'    => 'La fecha y hora de inicio son obligatorias.',
            'end_date.after_or_equal'=> 'La finalización no puede ser anterior al inicio.',
            
            'price.required_if'      => 'Los eventos de pago requieren un valor en COP.',
            'max_capacity.required_if'=> 'El aforo es obligatorio si activaste la Reserva QR.',
            
            'image.required'         => 'La matriz visual (imagen) es obligatoria.',
            'image.max'              => 'El archivo excede el límite de 5MB.',
        ];
    }
}