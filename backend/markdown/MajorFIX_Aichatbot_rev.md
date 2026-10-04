# Instruksi Refaktor Backend - PodoFriend (Arsitektur Sesi Chat)

**Konteks Sistem:**
Anda adalah AI Developer Agent spesialis Backend (Laravel 12). Saat ini, tabel `chat_histories` hanya menyimpan semua pesan pengguna dalam satu wadah datar, sehingga AI di *frontend* kehilangan konteks pemisah antar percakapan.
Tugas Anda adalah merestrukturisasi *database* dan API agar mendukung sistem multi-sesi (1 Sesi memiliki banyak Pesan) layaknya aplikasi *chatbot* modern.

---

## Langkah 1: Pembuatan & Pembaruan Migration

Kita membutuhkan tabel baru untuk menyimpan sesi, dan memperbarui tabel pesan lama untuk merujuk ke sesi tersebut.

1. **Buat Tabel `chat_sessions`:**
Buat *migration* baru untuk `chat_sessions`.
* Kolom: `id` (uuid, primary key), `user_id` (uuid, foreign key ke `users`), `title` (string, nullable - untuk judul ringkasan obrolan nanti), `created_at`, `updated_at`, `deleted_at` (soft deletes).


2. **Perbarui Tabel `chat_histories`:**
Buat *migration* untuk mengubah tabel `chat_histories`.
* Tambahkan kolom `chat_session_id` (uuid, foreign key ke `chat_sessions`, nullable pada saat transisi/migrasi awal, lalu buat strict).
* Pastikan kolom `sender` dan `message` tetap ada.
* *Catatan:* Anda boleh menghapus *migration/tabel* `chat_histories` yang lama dan membuatnya ulang jika aplikasi masih dalam tahap pengembangan lokal (belum produksi).



---

## Langkah 2: Pembaruan Model Eloquent

Pastikan relasi antar model diatur dengan benar menggunakan UUID dan Soft Deletes.

1. **Model `ChatSession.php`:**
* Gunakan trait `HasUuids` dan `SoftDeletes`.
* `fillable`: `['user_id', 'title']`.
* Relasi `user()` (belongsTo `User`).
* Relasi `messages()` (hasMany `ChatHistory`).


2. **Model `ChatHistory.php`:**
* Gunakan trait `HasUuids` dan `SoftDeletes`.
* `fillable`: `['chat_session_id', 'user_id', 'sender', 'message']`.
* Relasi `session()` (belongsTo `ChatSession`).



---

## Langkah 3: Pembuatan Controller API Baru

Buat `ChatSessionController` dan perbarui `ChatHistoryController` (atau gabungkan sesuai arsitektur RESTful).

1. **Membuat Sesi Baru (`POST /api/chat-sessions`)**
* **Logika:** Buat record baru di `chat_sessions` dengan `user_id` dari *user* yang terautentikasi (`auth()->id()`).
* **Return:** Data `chat_session` dengan status `201 Created`.


2. **Mengambil Daftar Sesi (`GET /api/chat-sessions`)**
* **Logika:** Ambil semua `chat_sessions` milik `auth()->id()`, urutkan dari yang terbaru (`orderBy('created_at', 'desc')`).
* **Return:** Array dari sesi obrolan (status `200 OK`).


3. **Menyimpan Pesan ke Sesi Spesifik (`POST /api/chat-sessions/{session_id}/messages`)**
* **Validasi:** Pastikan `{session_id}` ada dan milik `user` yang login. Validasi payload request: `sender` (in:user,ai) dan `message` (required, string).
* **Logika:** Simpan pesan ke `chat_histories` dengan menyertakan `chat_session_id` dari URL.
* **Return:** Data pesan yang baru disimpan (status `201 Created`).


4. **Mengambil Riwayat Pesan dari Sesi Spesifik (`GET /api/chat-sessions/{session_id}/messages`)**
* **Validasi:** Pastikan sesi adalah milik `user` yang login.
* **Logika:** Ambil data `chat_histories` berdasarkan `chat_session_id`. Urutkan berdasarkan `created_at` secara *ascending* (lama ke baru).
* **Return:** Array pesan obrolan (status `200 OK`).



---

## Langkah 4: Pembaruan Routes (`routes/api.php`)

Ganti atau hapus *routes* chat yang lama, lalu daftarkan *routes* baru ini di dalam grup *middleware* `auth:sanctum`:

```php
use App\Http\Controllers\ChatSessionController;

Route::middleware('auth:sanctum')->group(function () {
    // ... rute lainnya (timer, survei, dll) ...

    // AI Chat Sessions
    Route::post('/chat-sessions', [ChatSessionController::class, 'store']);
    Route::get('/chat-sessions', [ChatSessionController::class, 'index']);
    
    // AI Chat Messages
    Route::post('/chat-sessions/{session_id}/messages', [ChatSessionController::class, 'storeMessage']);
    Route::get('/chat-sessions/{session_id}/messages', [ChatSessionController::class, 'showMessages']);
});

```

*(Catatan untuk AI: Anda bisa memisahkan method `storeMessage` dan `showMessages` ke dalam `ChatMessageController` tersendiri agar lebih rapi sesuai prinsip Single Responsibility, silakan sesuaikan).*


## Langkah 5: Pengujian (Testing)

Perbarui atau buat *Feature Tests* untuk memastikan:

1. Pengguna bisa membuat sesi chat baru.
2. Pengguna tidak bisa mengakses atau memasukkan pesan ke `chat_session_id` milik pengguna lain (403 Forbidden / 404 Not Found).
3. Pengurutan *history* pesan yang dikembalikan harus dari yang paling lama ke paling baru (wajib *ascending*).
