# Instruksi Pengembangan API: Autentikasi & Logika Sesi Timer (Laravel 12)

**Konteks Sistem:**
Anda adalah AI developer agent yang bertugas membangun RESTful API menggunakan Laravel 12. Model, Migrasi (dengan UUID dan Soft Deletes), dan Resource telah selesai dibuat. Tugas Anda sekarang adalah mengimplementasikan logika Autentikasi (Laravel Sanctum) dan Logika Sesi Timer (Pomodoro) beserta kalkulasi gamifikasinya.

---

## 1. Fitur Autentikasi Pengguna (User Auth)

Buat `AuthController` untuk menangani proses pendaftaran, login, dan logout menggunakan Laravel Sanctum.

### A. Endpoint Registrasi (`POST /api/auth/register`)
**Validasi (Form Request):**
- `name`: required, string, max 255.
- `email`: required, string, email, unique:users.
- `password`: required, string, min 8, confirmed.

**Logika Kontroler:**
1. Hash password menggunakan `Hash::make()`.
2. Buat record baru di tabel `users`.
3. (Opsional/Otomatis) Inisialisasi record kosong di tabel `gamification_stats` dan `user_preferences` untuk user yang baru mendaftar.
4. Terbitkan token Sanctum: `$user->createToken('auth_token')->plainTextToken`.
5. Kembalikan response JSON berisi data user (via Resource) dan token.

### B. Endpoint Login (`POST /api/auth/login`)
**Validasi (Form Request):**
- `email`: required, email.
- `password`: required.

**Logika Kontroler:**
1. Cek kredensial menggunakan `Auth::attempt()`.
2. Jika gagal, kembalikan response error `401 Unauthorized`.
3. Jika berhasil, terbitkan token Sanctum baru.
4. Kembalikan response JSON berisi data user dan token.

### C. Endpoint Logout (`POST /api/auth/logout`)
- **Middleware:** `auth:sanctum`
- **Logika Kontroler:** Hapus token yang sedang digunakan: `$request->user()->currentAccessToken()->delete();`.
- Kembalikan response success `200 OK`.

---

## 2. Fitur Sesi Timer & Gamifikasi (Pomodoro Sessions)

Buat `SessionController` untuk mengelola data dari tabel `pomodoro_sessions` dan memicu pembaruan pada tabel `gamification_stats`.

### A. Memulai Sesi (`POST /api/sessions`)
- **Middleware:** `auth:sanctum`
- **Tujuan:** Mencatat waktu mulai saat pengguna menekan tombol "Start".
- **Logika Kontroler:**
  1. Buat record baru di `pomodoro_sessions`.
  2. Set `user_id` dari auth user.
  3. Set `start_time` dengan waktu saat ini (`now()`).
  4. Kembalikan response data sesi yang baru dibuat.

### B. Menyelesaikan Sesi (`PUT /api/sessions/{session_id}`)
- **Middleware:** `auth:sanctum`
- **Tujuan:** Mencatat waktu selesai, menghitung durasi, dan memperbarui status gamifikasi (streak & total waktu).
- **Validasi:** Pastikan `session_id` valid, milik user yang sedang login, dan `end_time` belum terisi.
- **Logika Sesi:**
  1. Ambil data sesi berdasarkan ID.
  2. Set `end_time` dengan waktu saat ini (`now()`).
  3. Hitung selisih menit antara `end_time` dan `start_time` menggunakan Carbon: `$start->diffInMinutes($end)`.
  4. Simpan hasilnya ke kolom `duration_minutes`.
  5. Simpan pembaruan record sesi.

### C. Logika Gamifikasi (Toleransi Streak & Pembaruan Waktu)
*Catatan: Logika ini bisa dijalankan langsung di dalam controller setelah update sesi, atau menggunakan Laravel Observer/Action Class agar lebih rapi.*

1. Ambil data `gamification_stats` milik user terkait.
2. Tambahkan `duration_minutes` dari sesi tadi ke dalam `total_focus_time`.
3. **Logika Kalkulasi Streak (Grace Day):**
   - Ambil `last_active_date` dan bandingkan dengan hari ini (abaikan jam, fokus pada tanggal).
   - Selisih Hari (`diffInDays`):
     - **0 Hari** (Sudah ada sesi hari ini): `current_streak` tidak berubah.
     - **1 Hari** (Sesi terakhir kemarin): `current_streak` **+1**.
     - **2 Hari** (Bolos 1 hari / Grace Day): `current_streak` **tidak berubah** (dipertahankan).
     - **> 2 Hari** (Bolos lebih dari 1 hari): `current_streak` **direset menjadi 1** (karena hari ini dihitung sesi baru).
4. Perbarui `last_active_date` menjadi hari ini (`now()`).
5. Simpan pembaruan ke tabel `gamification_stats`.

---

## 3. Pendaftaran Route (routes/api.php)

Gunakan kerangka route berikut untuk menginstruksikan pembuatan route API:

```php
use App\Http\Controllers\AuthController;
use App\Http\Controllers\SessionController;

Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    
    // Sessions
    Route::post('/sessions', [SessionController::class, 'start']);
    Route::put('/sessions/{id}', [SessionController::class, 'complete']);
    
    // Endpoint tambahan untuk mengambil riwayat / status (Bisa dibuat belakangan)
    // Route::get('/gamification/stats', [GamificationController::class, 'show']);
});
