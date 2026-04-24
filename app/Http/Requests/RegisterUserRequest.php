<?php
namespace App\Http\Requests;
use Illuminate\Foundation\Http\FormRequest;

class RegisterUserRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'name'      => 'required|string|max:150',
            'email'     => 'required|string|email|max:100|unique:users,email',
            'password'  => 'required|string|min:8|confirmed',
            // 🔥 SEGURIDAD: Quitamos 'admin' y 'cultural_manager' de aquí. Esos se asignan por DB.
            'user_type' => 'required|string|in:artist,visitor,educator' 
        ];
    }
}