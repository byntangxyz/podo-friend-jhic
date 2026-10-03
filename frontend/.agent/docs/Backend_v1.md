# Dokumen Spesifikasi API Backend - PodoFriend (Laravel 12)

**Base URL:** `http://localhost:8000` (atau sesuai konfigurasi *environment* lokal)
**Authentication:** Laravel Sanctum (Token-based)
**Header Default:**

* `Accept: application/json`
* `Content-Type: application/json`
* `Authorization: Bearer {token}` (untuk *Protected Routes*)

---

## 1. Authentication

### A. Register User

* **Endpoint:** `POST /api/auth/register`
* **Auth Required:** No
* **Description:** Mendaftarkan pengguna baru dan mengembalikan token akses.
* **Payload & Validation:**
```json
{
  "name": "required|string|max:255",
  "email": "required|string|email|max:255|unique:users",
  "password": "required|string|min:8|confirmed",
  "password_confirmation": "required|string|same:password"
}

```


* **Response Success (201 Created):** Mengembalikan data `user` dan `token`.

### B. Login User

* **Endpoint:** `POST /api/auth/login`
* **Auth Required:** No
* **Description:** Autentikasi pengguna dan mengembalikan token akses baru.
* **Payload & Validation:**
```json
{
  "email": "required|string|email",
  "password": "required|string"
}

```


* **Response Success (200 OK):** Mengembalikan data `user` dan `token`.

### C. Logout User

* **Endpoint:** `POST /api/auth/logout`
* **Auth Required:** Yes
* **Description:** Mencabut (*revoke*) token akses yang sedang digunakan.
* **Payload:** None
* **Response Success (200 OK):** Pesan sukses logout.

---

## 2. Daily Surveys (Mood Check-in)

### A. Simpan/Update Mood Hari Ini

* **Endpoint:** `POST /api/surveys/mood`
* **Auth Required:** Yes
* **Description:** Menyimpan *mood* pengguna. Jika hari ini pengguna sudah submit, data akan di-*update* (bukan duplikasi).
* **Payload & Validation:**
```json
{
  "mood": "required|string|max:50" 
}

```


*(Catatan: Valuenya disesuaikan dengan UI, misal: "cepat", "normal", "lambat")*
* **Response Success (200 OK / 201 Created):** Mengembalikan data `daily_survey` terbaru.

### B. Ambil Mood Hari Ini

* **Endpoint:** `GET /api/surveys/today`
* **Auth Required:** Yes
* **Description:** Mengambil data *mood* hari ini untuk konteks AI LangChain.
* **Payload:** None
* **Response Success (200 OK):** Data survei hari ini, atau `null` jika belum diisi.

---

## 3. Pomodoro Sessions

### A. Mulai Sesi (Start Timer)

* **Endpoint:** `POST /api/sessions`
* **Auth Required:** Yes
* **Description:** Mencatat `start_time` sesi Pomodoro baru di server.
* **Payload:** None
* **Response Success (201 Created):** Mengembalikan objek `session` berisi `id` (UUID) dan `start_time`.

### B. Selesaikan Sesi (Stop/Complete Timer)

* **Endpoint:** `PUT /api/sessions/{session_id}`
* **Auth Required:** Yes
* **Description:** Mencatat `end_time`, mengkalkulasi `duration_minutes` (dengan pembulatan `ceil` dan minimal 1 menit), serta otomatis memicu pembaruan `gamification_stats` (*streak* & *total waktu*).
* **URL Parameter:** `session_id` (UUID) - Wajib milik *user* yang terautentikasi.
* **Payload:** None
* **Response Success (200 OK):** Mengembalikan objek `session` yang telah diupdate beserta durasinya.

---

## 4. Gamification Stats

### A. Ambil Statistik Personal

* **Endpoint:** `GET /api/gamification/stats`
* **Auth Required:** Yes
* **Description:** Mengambil metrik progres gamifikasi (*streak* saat ini dan total waktu fokus) milik pengguna.
* **Payload:** None
* **Response Success (200 OK):**
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

* **Endpoint:** `GET /api/user/preferences`
* **Auth Required:** Yes
* **Description:** Mengambil gaya kepribadian AI (*chatbot personality*) milik pengguna.
* **Payload:** None
* **Response Success (200 OK):** Mengembalikan objek `user_preferences`.

### B. Update Preferensi AI

* **Endpoint:** `PUT /api/user/preferences`
* **Auth Required:** Yes
* **Description:** Memperbarui gaya kepribadian AI.
* **Payload & Validation:**
```json
{
  "chatbot_personality": "required|string|max:50"
}

```


* **Response Success (200 OK):** Mengembalikan data `user_preferences` yang sudah diperbarui.

---

## 6. AI Chat Memory (Chat Histories)

### A. Simpan Pesan Chat

* **Endpoint:** `POST /api/chat`
* **Auth Required:** Yes
* **Description:** Menyimpan log pesan (baik dari *user* maupun hasil *generate* dari LangChain di *frontend*) ke *database* untuk *memory buffer*.
* **Payload & Validation:**
```json
{
  "sender": "required|string|in:user,ai",
  "message": "required|string"
}

```


* **Response Success (201 Created):** Mengembalikan data pesan yang baru disimpan.

### B. Ambil Riwayat Chat

* **Endpoint:** `GET /api/chat`
* **Auth Required:** Yes
* **Description:** Mengambil histori obrolan terbaru dengan limit 50 pesan. Diurutkan secara *ascending* (dari pesan terlama ke terbaru) untuk dibaca oleh model AI (LangChain) atau di-*render* di UI *chat*.
* **Payload:** None
* **Response Success (200 OK):** Array objek `chat_histories`.

---

*Catatan Penanganan Error (Global):*

* Jika *validation fails* pada *request* ber-payload, API akan merespons dengan **422 Unprocessable Entity** beserta rincian kolom yang salah (`errors`).
* Jika token tidak valid / kedaluwarsa, API akan merespons dengan **401 Unauthorized**.