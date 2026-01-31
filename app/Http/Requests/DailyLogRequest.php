<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class DailyLogRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'date' => 'nullable|date|unique:daily_logs,date',
            'items' => 'required|array|min:1',
            'items.*.time' => 'required|date_format:H:i',
            'items.*.description' => 'required|string',
            'items.*.notes' => 'nullable|string',
            // Menambahkan required dan max 4MB (4096 KB)
            'items.*.photo' => 'required|image|mimes:jpeg,png,jpg|max:4096',
        ];
    }

    /**
     * Pesan kustom untuk validasi
     */
    public function messages(): array
    {
        return [
            'items.*.photo.required' => 'Foto wajib diunggah untuk setiap item log.',
            'items.*.photo.image'    => 'File harus berupa gambar.',
            'items.*.photo.mimes'    => 'Format gambar harus jpeg, png, atau jpg.',
            'items.*.photo.max'      => 'Ukuran foto maksimal adalah 4MB.',
            'items.*.time.required'  => 'Waktu harus diisi.',
            'items.*.description.required' => 'Deskripsi aktivitas tidak boleh kosong.',
        ];
    }
}
