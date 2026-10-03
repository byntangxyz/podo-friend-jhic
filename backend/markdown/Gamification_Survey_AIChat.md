# Instruksi Pengembangan API: Survei Mood, Memori AI, & Retrival Gamifikasi (Fase 2)

**Status Sebelumnya:**
Implementasi Autentikasi dan Logika Sesi Pomodoro telah selesai dengan sangat baik. `UpdateGamificationStatsAction` telah berhasil menangani kalkulasi *streak* (termasuk *grace day*) dan *total_focus_time* dengan *test coverage* 100% *passed*.

**Fokus Saat Ini:**
Tugas Anda selanjutnya adalah mengimplementasikan fitur pendukung AI (Survei Mood dan Memori Chat) serta melengkapi *endpoint* pengambilan data (Gamifikasi & Preferensi) agar *frontend* (Nuxt.js + LangChain) dapat membaca state (konteks) dari *backend* Laravel.

---

## 1. Fitur Mood Check-in (Daily Surveys)

Buat `SurveyController` untuk menyimpan dan mengambil data *mood* harian sebagai konteks awal (prompt) AI di *frontend*.

### A. Menyimpan / Mengupdate Mood Hari Ini (`POST /api/surveys/mood`)
**Validasi (Form Request):**
- `mood`: required, string, max:50 (contoh: "lelah", "fokus", "cemas").

**Logika Kontroler:**
1. Cek apakah ada record di tabel `daily_surveys` untuk `user_id` yang sedang *login* dengan `created_at` pada hari ini (gunakan `whereDate('created_at', today())`).
2. Jika belum ada, buat record baru (`create`).
3. Jika sudah ada, lakukan *update* pada record tersebut agar pengguna dapat meralat *mood* mereka pada hari yang sama.
4. Kembalikan response JSON `200 OK` (atau `201 Created`) beserta data survei.

### B. Mengambil Mood Terakhir (`GET /api/surveys/today`)
- **Tujuan:** Digunakan oleh *frontend* sebelum memulai sesi chat untuk memberikan konteks kondisi pengguna ke agen AI.
- **Logika:** Kembalikan data `daily_surveys` milik pengguna untuk hari ini. Jika tidak ada, kembalikan response JSON kosong atau `null` dengan status `200 OK`.

---

## 2. Fitur Memori Chat AI (Chat Histories)

Buat `ChatHistoryController`. *Backend* **TIDAK** memproses logika AI (LLM), melainkan hanya berfungsi sebagai *database memori* untuk LangChain di *frontend*.

### A. Menyimpan Log Pesan (`POST /api/chat`)
**Validasi (Form Request):**
- `sender`: required, string, in:user,ai.
- `message`: required, string.

**Logika Kontroler:**
1. Simpan pesan baru ke tabel `chat_histories` dengan `user_id` dari pengguna yang *login*.
2. Kembalikan response `201 Created` beserta data pesan.

### B. Mengambil Riwayat Percakapan (`GET /api/chat`)
- **Tujuan:** Mengembalikan riwayat percakapan agar *frontend* memiliki *memory buffer* saat memuat ulang halaman.
- **Logika:**
  1. Ambil data dari `chat_histories` berdasarkan `user_id`.
  2. Urutkan berdasarkan `created_at` secara *ascending* (lama ke baru) agar sesuai urutan baca.
  3. Berikan paginasi ringan (misal: 50 pesan terakhir) menggunakan `limit(50)` atau `paginate(50)`.

---

## 3. Retrival Data Gamifikasi & Preferensi Pengguna

Kalkulasi gamifikasi sudah ditangani oleh `UpdateGamificationStatsAction`. Sekarang, buat *endpoint* untuk mengambil (GET) data tersebut dan mengatur preferensi *chatbot*.

### A. Statistik Gamifikasi (`GET /api/gamification/stats`)
- **Logika:** Buat `GamificationController@show`. Ambil dan kembalikan record `gamification_stats` milik pengguna yang sedang *login* (tampilkan `current_streak`, `total_focus_time`, dan `last_active_date`).

### B. Manajemen Preferensi AI (`GET /api/user/preferences` & `PUT /api/user/preferences`)
- **Logika:** Buat `PreferenceController`.
  - **GET:** Kembalikan record `user_preferences` milik pengguna.
  - **PUT:** Validasi `chatbot_personality` (string, misal: "tegas", "santai", "suportif"), lalu *update* record tersebut.

---

## 4. Pendaftaran Route (`routes/api.php`)

Tambahkan daftar *route* berikut ke dalam grup `middleware('auth:sanctum')` yang sudah ada:

```php
use App\Http\Controllers\SurveyController;
use App\Http\Controllers\ChatHistoryController;
use App\Http\Controllers\GamificationController;
use App\Http\Controllers\PreferenceController;

// Daily Surveys (Mood)
Route::post('/surveys/mood', [SurveyController::class, 'store']);
Route::get('/surveys/today', [SurveyController::class, 'showToday']);

// AI Chat Memory
Route::post('/chat', [ChatHistoryController::class, 'store']);
Route::get('/chat', [ChatHistoryController::class, 'index']);

// Data Retrieval (Gamification & Preferences)
Route::get('/gamification/stats', [GamificationController::class, 'show']);
Route::get('/user/preferences', [PreferenceController::class, 'show']);
Route::put('/user/preferences', [PreferenceController::class, 'update']);
