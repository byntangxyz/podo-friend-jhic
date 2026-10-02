# Instruksi Pembuatan Backend API dengan Laravel 12

## Konteks & Peran
Kamu adalah seorang Senior Backend Developer yang sangat ahli menggunakan **Laravel 12**. Tugasmu adalah membuatkan struktur awal untuk RESTful API berdasarkan desain database (ERD) yang sudah ditentukan. 

Fokus pekerjaanmu saat ini HANYA pada 3 hal:
1. **Database Migrations**
2. **Eloquent Models**
3. **API Resources** (untuk response JSON yang bersih)

## Spesifikasi Umum (Wajib Diikuti)
1. **Primary Key**: Semua tabel menggunakan `UUID` sebagai Primary Key, BUKAN auto-increment integer.
2. **Foreign Key**: Semua relasi menggunakan `UUID`.
3. **Timestamps & Soft Deletes**: Sebagian besar tabel memiliki `created_at`, `updated_at`, dan `deleted_at`. Gunakan trait `SoftDeletes` dan method `$table->softDeletes()` pada migration.
4. **Relasi**: Terapkan relasi Eloquent yang tepat (HasOne, HasMany, BelongsTo) di setiap model.

---

## Detail Skema Database (ERD)

Berikut adalah struktur tabel berdasarkan ERD yang harus kamu buatkan migration dan modelnya:

### 1. Table: `users`
*   **Kolom**:
    *   `id` (uuid, Primary Key)
    *   `name` (varchar/string)
    *   `email` (varchar/string, unique)
    *   `password_hash` (varchar/string) -> *Catatan: di model Laravel, ini biasanya 'password', sesuaikan dengan field ini atau berikan mapping yang tepat.*
    *   `created_at` (timestamp)
    *   `updated_at` (timestamp)
    *   `deleted_at` (timestamp)
*   **Relasi**:
    *   Has One: `user_preferences`
    *   Has One: `gamification_stats`
    *   Has Many: `daily_surveys`, `pomodoro_sessions`, `chat_histories`

### 2. Table: `user_preferences`
*   **Kolom**:
    *   `id` (uuid, Primary Key)
    *   `user_id` (uuid, Foreign Key ke users.id, Not Null)
    *   `chatbot_personality` (varchar/string, nullable)
    *   `created_at`, `updated_at`, `deleted_at` (timestamps)

### 3. Table: `gamification_stats`
*   **Kolom**:
    *   `id` (uuid, Primary Key)
    *   `user_id` (uuid, Foreign Key ke users.id, Not Null)
    *   `current_streak` (integer, default 0)
    *   `total_focus_time` (integer, default 0)
    *   `last_active_date` (timestamp/datetime, nullable)
    *   `created_at`, `updated_at`, `deleted_at` (timestamps)

### 4. Table: `daily_surveys`
*   **Kolom**:
    *   `id` (uuid, Primary Key)
    *   `user_id` (uuid, Foreign Key ke users.id, Not Null)
    *   `mood` (varchar/string)
    *   `created_at` (timestamp)
    *   `deleted_at` (timestamp)
    *   *(Gunakan standard timestamps nullable jika diperlukan oleh Laravel)*

### 5. Table: `pomodoro_sessions`
*   **Kolom**:
    *   `id` (uuid, Primary Key)
    *   `user_id` (uuid, Foreign Key ke users.id, Not Null)
    *   `start_time` (timestamp/datetime)
    *   `end_time` (timestamp/datetime, nullable)
    *   `duration_minutes` (integer, nullable)
    *   `created_at` (timestamp)
    *   `deleted_at` (timestamp)

### 6. Table: `chat_histories`
*   **Kolom**:
    *   `id` (uuid, Primary Key)
    *   `user_id` (uuid, Foreign Key ke users.id, Not Null)
    *   `sender` (varchar/string) -> *Misal: 'user' atau 'bot'*
    *   `message` (text)
    *   `created_at` (timestamp)
    *   `deleted_at` (timestamp)

---

## Output yang Diharapkan dari Kamu (AI Agent)

Tolong hasilkan kode lengkap untuk komponen-komponen berikut:

### 1. Migrations
*   Gunakan sintaks Laravel 12 (anonymous migrations).
*   Gunakan `$table->uuid('id')->primary();` untuk PK.
*   Gunakan `$table->foreignUuid('user_id')->constrained()->cascadeOnDelete();` untuk FK.
*   Pastikan urutan pembuatan tabel benar (tabel `users` dibuat pertama kali).

### 2. Models
*   Sertakan trait `Illuminate\Database\Eloquent\Concerns\HasUuids` (atau sesuaikan dengan best practice Laravel 12 untuk UUID).
*   Sertakan trait `Illuminate\Database\Eloquent\SoftDeletes`.
*   Tentukan `$fillable` property untuk Mass Assignment.
*   Sembunyikan kolom sensitif menggunakan `$hidden` (seperti `password_hash` di tabel `users`).
*   Tulis semua method relasi (`user()`, `preferences()`, `pomodoroSessions()`, dll).

### 3. API Resources
*   Buatkan class Resource (contoh: `UserResource`, `PomodoroSessionResource`, dll) menggunakan `php artisan make:resource`.
*   Format output array pada method `toArray()` agar respons JSON rapi, memetakan semua kolom yang relevan.
*   Sertakan *conditional relationship loading* (misal: `'preferences' => new UserPreferenceResource($this->whenLoaded('preferences'))`) jika diperlukan.

**Silakan mulai men-generate kodenya secara berurutan: Migrations, Models, lalu API Resources.**

