# Dokumen Spesifikasi API Backend - PodoFriend (Laravel 12)

**Base URL:** `http://localhost:8000` (atau sesuai konfigurasi _environment_ lokal)
**Authentication:** Laravel Sanctum (Token-based)
**Header Default:**

- `Accept: application/json`
- `Content-Type: application/json`
- `Authorization: Bearer {token}` (untuk _Protected Routes_)

Semua api response punya format:

```json
{
  "success": "string",
  "message": "string",
  "data": {}
}
```

---

## 1. Authentication

### A. Register User

- **Endpoint:** `POST /api/auth/register`
- **Auth Required:** No
- **Description:** Mendaftarkan pengguna baru dan mengembalikan token akses.
- **Payload & Validation:**

```json
{
  "name": "required|string|max:255",
  "email": "required|string|email|max:255|unique:users",
  "password": "required|string|min:8|confirmed",
  "password_confirmation": "required|string|same:password"
}
```

- **Response Success (201 Created):** Mengembalikan data `user` dan `token`.

### B. Login User

- **Endpoint:** `POST /api/auth/login`
- **Auth Required:** No
- **Description:** Autentikasi pengguna dan mengembalikan token akses baru.
- **Payload & Validation:**

```json
{
  "email": "required|string|email",
  "password": "required|string"
}
```

- **Response Success (200 OK):** Mengembalikan data `user` dan `token`.

### C. Logout User

- **Endpoint:** `POST /api/auth/logout`
- **Auth Required:** Yes
- **Description:** Mencabut (_revoke_) token akses yang sedang digunakan.
- **Payload:** None
- **Response Success (200 OK):** Pesan sukses logout.

---

## 2. Daily Surveys (Mood Check-in)

### A. Simpan/Update Mood Hari Ini

- **Endpoint:** `POST /api/surveys/mood`
- **Auth Required:** Yes
- **Description:** Menyimpan _mood_ pengguna. Jika hari ini pengguna sudah submit, data akan di-_update_ (bukan duplikasi).
- **Payload & Validation:**

```json
{
  "mood": "required|string|max:50"
}
```

_(Catatan: Valuenya disesuaikan dengan UI, misal: "cepat", "normal", "lambat")_

- **Response Success (200 OK / 201 Created):** Mengembalikan data `daily_survey` terbaru.

### B. Ambil Mood Hari Ini

- **Endpoint:** `GET /api/surveys/today`
- **Auth Required:** Yes
- **Description:** Mengambil data _mood_ hari ini untuk konteks AI LangChain.
- **Payload:** None
- **Response Success (200 OK):** Data survei hari ini, atau `null` jika belum diisi.

---

## 3. Pomodoro Sessions

### A. Mulai Sesi (Start Timer)

- **Endpoint:** `POST /api/sessions`
- **Auth Required:** Yes
- **Description:** Mencatat `start_time` sesi Pomodoro baru di server.
- **Payload:** None
- **Response Success (201 Created):** Mengembalikan objek `session` berisi `id` (UUID) dan `start_time`.

### B. Selesaikan Sesi (Stop/Complete Timer)

- **Endpoint:** `PUT /api/sessions/{session_id}`
- **Auth Required:** Yes
- **Description:** Mencatat `end_time`, mengkalkulasi `duration_minutes` (dengan pembulatan `ceil` dan minimal 1 menit), serta otomatis memicu pembaruan `gamification_stats` (_streak_ & _total waktu_).
- **URL Parameter:** `session_id` (UUID) - Wajib milik _user_ yang terautentikasi.
- **Payload:** None
- **Response Success (200 OK):** Mengembalikan objek `session` yang telah diupdate beserta durasinya.

---

## 4. Gamification Stats

### A. Ambil Statistik Personal

- **Endpoint:** `GET /api/gamification/stats`
- **Auth Required:** Yes
- **Description:** Mengambil metrik progres gamifikasi (_streak_ saat ini dan total waktu fokus) milik pengguna.
- **Payload:** None
- **Response Success (200 OK):**

```json
{
  "current_streak": 5,
  "total_focus_time": 120,
  "last_active_date": "2026-10-03T12:34:53.000000Z"
}
```

---

## 5. User Preferences (AI & Settings)

### A. Ambil Preferensi AI

- **Endpoint:** `GET /api/user/preferences`
- **Auth Required:** Yes
- **Description:** Mengambil gaya kepribadian AI (_chatbot personality_) milik pengguna.
- **Payload:** None
- **Response Success (200 OK):** Mengembalikan objek `user_preferences`.

### B. Update Preferensi AI

- **Endpoint:** `PUT /api/user/preferences`
- **Auth Required:** Yes
- **Description:** Memperbarui gaya kepribadian AI.
- **Payload & Validation:**

```json
{
  "chatbot_personality": "required|string|max:50"
}
```

- **Response Success (200 OK):** Mengembalikan data `user_preferences` yang sudah diperbarui.

---

## 6. AI Chat Memory (Chat Histories)

### A. Simpan Pesan Chat

- **Endpoint:** `POST /api/chat`
- **Auth Required:** Yes
- **Description:** Menyimpan log pesan (baik dari _user_ maupun hasil _generate_ dari LangChain di _frontend_) ke _database_ untuk _memory buffer_.
- **Payload & Validation:**

```json
{
  "sender": "required|string|in:user,ai",
  "message": "required|string"
}
```

- **Response Success (201 Created):** Mengembalikan data pesan yang baru disimpan.

### B. Ambil Riwayat Chat

- **Endpoint:** `GET /api/chat`
- **Auth Required:** Yes
- **Description:** Mengambil histori obrolan terbaru dengan limit 50 pesan. Diurutkan secara _ascending_ (dari pesan terlama ke terbaru) untuk dibaca oleh model AI (LangChain) atau di-_render_ di UI _chat_.
- **Payload:** None
- **Response Success (200 OK):** Array objek `chat_histories`.

---

_Catatan Penanganan Error (Global):_

- Jika _validation fails_ pada _request_ ber-payload, API akan merespons dengan **422 Unprocessable Entity** beserta rincian kolom yang salah (`errors`).
- Jika token tidak valid / kedaluwarsa, API akan merespons dengan **401 Unauthorized**.
