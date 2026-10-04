# Instruksi Pengembangan Frontend - PodoFriend (Phase 4B: Tasks, Achievements & Settings)

> **Target Pengembang:** AI Developer Agent / Tim Frontend Nuxt 4  
> **Konteks:** Melanjutkan penyelesaian backend Phase 4A (Laravel 12). Phase 4B menyulap UI Timer, menghubungkan To-Do List Harian dengan API backend, merayakan pencapaian (*achievements*) baru yang terbuka secara interaktif, dan menyediakan halaman Pengaturan Akun (*Settings & Profile*).

---

## 1. Ikhtisar & Arsitektur Fitur

Phase 4B berfokus pada 3 modul integrasi frontend:
1. **To-Do List Harian (Tasks)**:
   - Terintegrasi penuh dengan backend API (`GET /api/tasks`, `POST /api/tasks`, `PUT /api/tasks/{id}/toggle`, `DELETE /api/tasks/{id}`).
   - Mendukung fallback *Guest Mode* (menggunakan `localStorage`) ketika pengguna belum masuk (*unauthenticated*).
   - Pengguna dapat memilih task aktif untuk disinkronkan langsung dengan timer fokus Pomodoro.
2. **Sistem Pencapaian (Achievements) & Perayaan Interaktif**:
   - Menghubungkan daftar pencapaian di `/gamification/stats` dengan data riil dari `GET /api/achievements`.
   - Mengonsumsi `meta.newly_unlocked_achievements` dari respons penyelesaian sesi timer (`PUT /api/sessions/{id}`).
   - Menampilkan modal perayaan (*Celebration Modal*) interaktif lengkap dengan maskot Podo beranimasi antusias (*excited*), ikon badge berkilau, dan pesan motivasi.
3. **Pengaturan Akun & Profil (`/settings`)**:
   - Halaman baru `/settings` menggunakan layout dashboard.
   - Pembaruan nama & email (`PUT /api/user/profile`) dengan sinkronisasi ke Pinia `authStore`.
   - Pembaruan kata sandi (`PUT /api/user/password`) dengan validasi keamanan dan konfirmasi.
   - Pengaturan preferensi nada kepribadian AI Companion (`/api/user/preferences`).
   - Tautan navigasi aktif di header desktop dan navigasi mobile.

---

## 2. Rincian Implementasi per Modul

### Modul A: To-Do List Harian (Tasks)

1. **TypeScript Interface (`app/types/task.ts`)**:
   ```typescript
   export interface Task {
     id: string
     user_id?: string
     title: string
     is_completed: boolean
     created_at: string
     updated_at?: string
   }

   export interface TaskResponse {
     status: string
     message: string
     data: Task
   }

   export interface TaskListResponse {
     status: string
     message: string
     data: Task[]
   }
   ```

2. **Pinia Store (`app/stores/task.ts`)**:
   - `state`:
     - `tasks: Task[]`
     - `isLoading: boolean`
     - `isSubmitting: boolean`
     - `error: string | null`
   - `getters`:
     - `completedCount`: Jumlah tugas yang selesai.
     - `pendingCount`: Jumlah tugas yang belum selesai.
     - `sortedTasks`: Tugas belum selesai di atas, diurutkan waktu pembuatan terbaru.
   - `actions`:
     - `fetchTasks()`: Memanggil `GET /api/tasks` jika terautentikasi; jika tamu, muat dari `localStorage`.
     - `addTask(title: string)`: Memanggil `POST /api/tasks`; otomatis tetapkan sebagai task aktif timer jika belum ada task aktif.
     - `toggleTask(id: string)`: Optimistic UI update + memanggil `PUT /api/tasks/{id}/toggle`.
     - `deleteTask(id: string)`: Optimistic UI update + memanggil `DELETE /api/tasks/{id}`.

3. **Komponen `PomodoroTimer.vue`**:
   - Gantikan logika mock `useLocalStorage` dengan `useTaskStore()`.
   - Sinkronisasi `timerStore.setActiveTask` saat tugas dipilih atau ditambahkan.
   - Tampilkan progress indikator tugas selesai (`X/Y`).

---

### Modul B: Integrasi Pencapaian & Modal Perayaan

1. **Definisi 5 Kode Pencapaian Resmi (`app/types/achievement.ts`)**:
   - `FIRST_SESSION`: Langkah Awal (Menyelesaikan sesi Pomodoro pertama)
   - `FIRST_60_MIN`: 1 Jam Pertama (Mencapai total fokus 60 menit)
   - `STREAK_2_DAYS`: Konsisten 2 Hari (Streak belajar 2 hari)
   - `STREAK_3_DAYS`: Konsisten 3 Hari (Streak belajar 3 hari)
   - `STREAK_7_DAYS`: Konsisten Mingguan (Streak belajar 7 hari)

2. **Pembaruan `app/stores/gamification.ts`**:
   - Tambahkan `unlockedCodes: string[]` pada state.
   - Tambahkan aksi `fetchAchievements()` yang memanggil `GET /api/achievements`.
   - Sesuaikan getter `achievements` agar menggunakan 5 kode resmi dan mencocokkan status pembukaan dari `unlockedCodes`.

3. **Pembaruan `app/stores/timer.ts`**:
   - Pada metode `completeSession()`:
     - Tangkap respons `meta.newly_unlocked_achievements`.
     - Jika ada kode pencapaian baru (`length > 0`), simpan ke state `newlyUnlockedAchievements` dan picu `isAchievementCelebrationOpen = true`.
     - Segera panggil `gamificationStore.fetchStats()` dan `gamificationStore.fetchAchievements()`.

4. **Komponen Modal Perayaan (`app/components/AchievementCelebrationModal.vue`)**:
   - Tampil ketika `timerStore.isAchievementCelebrationOpen` bernilai `true`.
   - Menggunakan `AppMascot.vue` dengan `animation="excited"` dan ukuran `lg`.
   - Kartu berkilau (*glow effect*) berwarna Warm Orange khas PodoFriend.
   - Menampilkan daftar pencapaian yang baru saja terbuka beserta ikon dan keterangannya.
   - Tombol aksi "Keren, Lanjutkan Belajar!" untuk menutup modal.

5. **Pembaruan Halaman `/gamification/stats.vue`**:
   - Menampilkan kartu pencapaian berdasarkan data riil dari backend.
   - Menampilkan persentase pencapaian dan progress bar yang akurat.

---

### Modul C: Halaman Pengaturan Akun & Profil (`/settings`)

1. **Halaman Baru (`app/pages/settings.vue`)**:
   - `definePageMeta({ layout: 'dashboard' })`.
   - **Bagian 1: Data Diri**:
     - Form nama & email.
     - Tombol "Simpan Profil".
     - Memanggil `PUT /api/user/profile`.
     - Perbarui `authStore.user` seketika saat sukses.
   - **Bagian 2: Keamanan Akun**:
     - Form password saat ini, password baru, dan konfirmasi password baru.
     - Toggle lihat/sembunyikan password.
     - Indikator kesesuaian dan panjang password minimal 8 karakter.
     - Memanggil `PUT /api/user/password`.
   - **Bagian 3: Preferensi Pendamping Belajar (AI Companion)**:
     - Pilihan gaya respon Podo: *Empatik & Mendukung*, *Tegas & Disiplin*, *Santai & Bersahabat*, *Penyemangat & Energik*.
     - Terintegrasi dengan `usePreferencesStore()` (`PUT /api/user/preferences`).
   - **Bagian 4: Zona Keluar**:
     - Tombol Logout dengan konfirmasi.

2. **Pembaruan Navigasi (`app/layouts/dashboard.vue`)**:
   - Aktifkan navigasi ke `/settings` di header desktop dan menu mobile (hilangkan badge *Soon*).
   - Tautkan kartu mini profil di pojok kanan atas agar dapat langsung diklik menuju `/settings`.

---

## 3. Langkah Verifikasi & Kualitas

1. `pnpm typecheck`: Memastikan tidak ada pelanggaran tipe TypeScript di seluruh file baru dan modifikasi.
2. Pengujian interaksi:
   - Tambah task baru, toggle selesai, pilih task untuk fokus, hapus task.
   - Jalankan sesi pomodoro singkat hingga selesai, pastikan respons `newly_unlocked_achievements` memunculkan modal perayaan jika ada pencapaian baru.
   - Buka `/gamification/stats`, pastikan badge pencapaian sesuai dengan database.
   - Buka `/settings`, perbarui nama dan password, pastikan pesan sukses muncul dan data profil tersinkronisasi.
