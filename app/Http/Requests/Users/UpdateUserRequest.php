<?php

namespace App\Http\Requests\Users;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;
use Inertia\Inertia;
class UpdateUserRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return Auth::check();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => 'required|string|max:50',
            'email' => 'required|email|max:255|unique:users,email,' . $this->route('user')->id,
            'password' => 'nullable|string|min:8|max:50',
            'role_id' => 'required|exists:roles,id',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Le nom est requis',
            'name.max' => 'Le nom ne peut pas contenir plus de 2 caractères',
            'email.required' => 'L\'adresse courriel est requise',
            'email.email' => 'L\'adresse courriel est invalide',
            'email.unique' => 'L\'adresse courriel est déjà utilisée',
            'password.min' => 'Le mot de passe doit contenir au moins 8 caractères',
            'password.max' => 'Le mot de passe ne peut pas contenir plus de 50 caractères',
            'role_id.required' => 'Le rôle est requis',
            'role_id.exists' => 'Le rôle sélectionné n\'existe pas',
        ];
    }
}
