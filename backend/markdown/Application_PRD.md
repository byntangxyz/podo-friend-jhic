# Product Requirements Document (PRD) - API Reference

**Project Name:** PodoFriend — Anti-Burnout Focus & Study Companion
**Document Version:** 2.1 (Updated for Laravel 12 API - Frontend AI Offloading)
**Architecture:** Headless / RESTful API (Laravel 12)

---

## 1. Executive Summary

**Product Vision:**
Yogaruh adalah web app manajemen fokus berbasis teknik Pomodoro yang dipersonalisasi oleh AI Companion, dirancang untuk mencegah burnout akademik.
**API Goal:**
Menyediakan RESTful API yang tangguh, aman, dan efisien menggunakan Laravel 12. Karena pemrosesan AI ditangani oleh _frontend_ (Nuxt.js + LangChain), API ini difokuskan pada manajemen _state_ (autentikasi, sesi, survei, gamifikasi) dan penyimpanan riwayat (histori percakapan AI), bukan sebagai _proxy_ ke layanan LLM.

## 2. API Scope & Non-Goals

**In Scope (MVP API):**

- Autentikasi & Manajemen Pengguna (CRUD).
- Endpoint _Mood Check-in_ Harian.
- Endpoint Manajemen Sesi Pomodoro (Start, Pause/Resume, Stop, Log).
- Endpoint Penyimpanan & Pengambilan Histori Chat AI Companion.
- Endpoint Kalkulasi Gamifikasi Dasar (Streak harian dengan _grace day_, Total waktu fokus).

**Out of Scope / Non-Goals:**

- **Integrasi LLM/AI (OpenAI/Anthropic, dll): Tidak dilakukan di backend.**
- Fitur _Achievements_ atau _Badges_ (tidak didukung di skema database fase ini).
- Fitur komunitas/co-working publik.

## 3. Database Schema Mapping (Reference)

API harus mengimplementasikan migrasi dan model Eloquent berdasarkan spesifikasi struktur berikut (semua tabel menggunakan UUID untuk `id` dan relasi, serta mendukung _Soft Deletes_ via `deleted_at`):

1. **`users`**: `id` (uuid), `name` (varchar), `email` (varchar), `password_hash` (varchar), `created_at`, `updated_at`, `deleted_at`.
2. **`user_preferences`**: `id` (uuid), `user_id` (uuid), `chatbot_personality` (varchar), `created_at`, `updated_at`, `deleted_at`.
3. **`daily_surveys`**: `id` (uuid), `user_id` (uuid), `mood` (varchar), `created_at`, `deleted_at`. _(Catatan: tidak ada updated_at)_.
4. **`pomodoro_sessions`**: `id` (uuid), `user_id` (uuid), `start_time` (timestamp), `end_time` (timestamp), `duration_minutes` (integer), `created_at`, `deleted_at`.
5. **`chat_histories`**: `id` (uuid), `user_id` (uuid), `sender` (varchar), `message` (text), `created_at`, `deleted_at`.
6. **`gamification_stats`**: `id` (uuid), `user_id` (uuid), `current_streak` (integer), `total_focus_time` (integer), `last_active_date` (timestamp), `created_at`, `updated_at`, `deleted_at`.

## 4. User Stories & Functional Requirements (API Perspective)

### Epic 1: Onboarding & Mood Check-in

- **US-01:** API menyediakan endpoint `POST /api/surveys` untuk menerima input `mood` pengguna. Data ini akan dipanggil oleh _frontend_ nantinya sebagai konteks bagi agen LangChain.

### Epic 2: Focus & Break Mode (Pomodoro Sessions)

- **US-02:** API memiliki endpoint `POST /api/sessions` untuk mencatat awal sesi, dan `PUT /api/sessions/{id}` untuk mencatat waktu selesai (`end_time`) serta mengkalkulasi `duration_minutes`.

### Epic 3: Gamifikasi & Progress (Stats & Streaks)

- **US-03:** API memiliki logika _Observer_ atau _Job_ di Laravel yang otomatis memperbarui tabel `gamification_stats` (`total_focus_time` dan `last_active_date`) setiap kali sesi Pomodoro diselesaikan.
- **US-04:** Sistem _streak_ (`current_streak`) memiliki logika toleransi. Jika `last_active_date` selisih 1 hari, _streak_ bertambah. Jika selisih 2 hari (_grace day_), _streak_ dipertahankan. Jika > 2 hari, _streak_ direset ke 0.

### Epic 4: AI Chat Companion (Storage Only)

- **US-05:** Karena AI ditangani oleh Nuxt + LangChain, API cukup menyediakan endpoint `POST /api/chat` untuk **menerima dan menyimpan riwayat pesan** yang sudah diproses di _frontend_ (menyimpan pengirim `user` dan `ai` ke tabel `chat_histories`).
- **US-06:** API menyediakan endpoint `GET /api/chat` agar _frontend_ dapat memuat ulang riwayat percakapan sebelumnya saat pengguna membuka aplikasi kembali, sehingga LangChain memiliki memori percakapan.

## 5. Technical Considerations & Constraints

**Tech Stack Framework:**

- **Framework:** Laravel 12.x
- **Authentication:** Laravel Sanctum (Token-based API Authentication).
- **ORM:** Eloquent ORM dengan trait `HasUuids` dan `SoftDeletes`.
- **Database:** PostgreSQL atau MySQL.
- **Form Request Validation:** Semua request masuk wajib divalidasi menggunakan _Form Request_ bawaan Laravel.

**Security & Privacy:**

- Semua endpoint (kecuali _Register/Login_) dilindungi _middleware_ `auth:sanctum`.
- API harus memastikan _Authorization_: Pengguna hanya dapat mengakses, mengubah, atau menghapus data miliknya sendiri (`user_id` == `auth()->id()`).

## 6. Target API Endpoints (Draft)

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/user/preferences` & `PUT /api/user/preferences`
- `POST /api/surveys/mood` (Simpan survei harian)
- `GET /api/surveys/today` (Ambil data mood hari ini untuk konteks prompt LangChain di frontend)
- `POST /api/sessions` (Start pomodoro)
- `PUT /api/sessions/{id}` (Complete/stop pomodoro)
- `GET /api/sessions/history` (Ambil riwayat sesi)
- `GET /api/gamification/stats` (Ambil status streak & total waktu untuk konteks LangChain di frontend)
- `POST /api/chat` (Simpan log pesan dari frontend ke database)
- `GET /api/chat` (Ambil riwayat pesan untuk memori LangChain)

## 7. Api Response Format

### Format JSON Umum

```json
{
  "status": "success",
  "message": "Operation successful",
  "data": { ... }
}
```

Status codes:
200 OK: Resource fetched successfully
201 Created: Resource created successfully
204 No Content: Operation successful, no data to return (e.g., soft delete)
400 Bad Request: Validation error or invalid input
401 Unauthorized: Missing or invalid authentication
403 Forbidden: Authenticated but not authorized
404 Not Found: Resource does not exist
409 Conflict: Resource already exists (e.g., duplicate email)
500 Internal Server Error: Unexpected server error
