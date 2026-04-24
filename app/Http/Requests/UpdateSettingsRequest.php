<?php
namespace App\Http\Requests;
use Illuminate\Foundation\Http\FormRequest;

class UpdateSettingsRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'public_profile'       => 'required|boolean',
            'email_notifications'  => 'required|boolean',
            'nearby_events_notify' => 'required|boolean',
            'theme'                => 'nullable|string|in:light,dark,auto',
        ];
    }
}