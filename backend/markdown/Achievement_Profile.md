# Instruksi Pengembangan Backend - PodoFriend (Phase 4A: Tasks, Achievements & Settings)

**Konteks Sistem:**
Anda adalah AI Developer Agent spesialis Backend (Laravel 12). Tugas Anda di Phase 4A adalah menambahkan fitur "To-Do List Harian" (Tasks), membangun logika pembukaan "Pencapaian" (Achievements) secara otomatis, dan melengkapi API untuk Pengaturan Akun.

---

## Langkah 1: Sistem To-Do List Harian (Tasks)

Tugas ini bersifat mandiri (_standalone_), terikat pada `user_id`, dan bisa dicentang kapan saja oleh pengguna.

1. **Migration & Model `Task`:**

- Buat tabel `tasks` dengan kolom: `id` (uuid), `user_id` (uuid, foreign key), `title` (string), `is_completed` (boolean, default: false), dan `timestamps`.
- Buat model `Task.php` dengan relasi `belongsTo(User::class)`.

2. **Controller & Routes (`TaskController`):**

- `GET /api/tasks`: Ambil semua task milik `auth()->id()` (urutkan yang belum selesai di atas, lalu berdasarkan `created_at`).
- `POST /api/tasks`: Buat task baru (validasi: `title` required, string).
- `PUT /api/tasks/{task}/toggle`: Ubah status `is_completed` menjadi sebaliknya (true/false).
- `DELETE /api/tasks/{task}`: Hapus task.
- Pastikan ada proteksi otorisasi (hanya pemilik yang bisa ubah/hapus).

---

## Langkah 2: Sistem Pencapaian (Achievements)

Pencapaian tidak perlu tabel master yang rumit, cukup gunakan kode konstan dan tabel _pivot_ untuk melacak apa yang sudah diraih pengguna.

1. **Migration & Model `UserAchievement`:**

- Buat tabel `user_achievements` dengan kolom: `id` (uuid), `user_id` (uuid, foreign key), `achievement_code` (string), `unlocked_at` (timestamp).
- Pastikan kombinasi `user_id` dan `achievement_code` adalah _unique_ agar tidak ada duplikasi.

2. **Daftar Kode Pencapaian (Achievement Codes):**

- `FIRST_SESSION` (Langkah Awal - Menyelesaikan sesi pertama)
- `FIRST_60_MIN` (1 Jam Pertama - Total fokus mencapai 60 menit)
- `STREAK_2_DAYS` (Konsisten 2 Hari - Mencapai streak 2 hari)
- `STREAK_3_DAYS` (Konsisten 3 Hari - Mencapai streak 3 hari)
- `STREAK_7_DAYS` (Konsisten Mingguan - Mencapai streak 7 hari)

3. **Logika Unlock Otomatis (Krusial):**

- Buka `SessionController.php` pada metode `update` (saat timer selesai).
- Setelah menghitung `duration_minutes` dan mengupdate `gamification_stats` (total waktu & streak), jalankan fungsi pengecekan _achievement_.
- _Logika Cek:_
- Cek apakah `total_focus_time >= 60` (Buka `FIRST_60_MIN`).
- Cek apakah `current_streak == 2, 3, atau 7` (Buka masing-masing streak).
- Cek apakah ini sesi pertama (Buka `FIRST_SESSION`).

- _Modifikasi Respons:_ Jika ada pencapaian baru yang terbuka pada sesi tersebut, sisipkan di _response_ API agar _frontend_ bisa memunculkan _Toast Popup_. Contoh respons:
  `"meta": { "newly_unlocked_achievements": ["FIRST_SESSION", "STREAK_2_DAYS"] }`

4. **Route Baru:**

- `GET /api/achievements`: Mengembalikan daftar `achievement_code` yang sudah dimiliki oleh `auth()->id()`.

---

## Langkah 3: API Pengaturan Akun (Settings)

Lengkapi rute untuk halaman profil agar pengguna bisa mengubah data mereka.

1. **Controller `ProfileController`:**

- `PUT /api/user/profile`: Update nama dan email. (Validasi: `name` required, `email` required & unique kecuali milik sendiri).
- `PUT /api/user/password`: Update kata sandi. (Validasi: `current_password` harus cocok, `new_password` min 8 dan confirmed).

2. _(Catatan: Fitur Logout sudah tersedia di `/api/auth/logout`, tidak perlu dibuat ulang)._

---

**Instruksi Tambahan:**
Pastikan semua _routes_ baru didaftarkan di dalam grup `auth:sanctum`. Jalankan _testing_ atau pastikan _response_ dari `PUT /api/sessions/{session_id}` tidak _error_ dan berhasil menyertakan parameter `newly_unlocked_achievements` (array kosong jika tidak ada yang baru).

---
