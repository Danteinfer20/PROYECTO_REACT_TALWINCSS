<?php
namespace App\Http\Requests;

use App\Rules\Contrasena;
use Illuminate\Foundation\Http\FormRequest;

class RegisterUserRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'name'      => 'required|string|max:150',
            'email'     => 'required|string|email|max:100|unique:users,email',
            // El criterio vive en App\Rules\Contrasena, compartido con el
            // restablecimiento. Antes acá decía `min:8` y allá otra cosa.
            'password'  => Contrasena::reglas(),
            // 🔥 SEGURIDAD: Quitamos 'admin' y 'cultural_manager' de aquí. Esos se asignan por DB.
            'user_type' => 'required|string|in:artist,visitor,educator'
        ];
    }

    public function messages(): array
    {
        return Contrasena::mensajes();
    }
}
