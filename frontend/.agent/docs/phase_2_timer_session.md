# Instruksi Pengembangan Frontend - PodoFriend (Phase 2: Guest Timer, Dashboard & Mood)

**Konteks Sistem:** 
Anda adalah AI Developer Agent (Nuxt 4, Vue 3, Tailwind CSS). Phase 1 telah selesai. Tugas Anda pada Phase 2 adalah memisahkan logika Timer publik (`/timer`) dan Timer terproteksi, membangun *Layout Dashboard*, Sistem Survei *Mood*, dan Retrival Data Gamifikasi.

---

## Langkah 1: Halaman Timer Publik (Guest Timer)
Pengguna yang belum login harus bisa menggunakan Pomodoro Timer, namun sesinya tidak akan disimpan ke *database*.

1. **Buat Rute Publik `/pages/timer.vue`:**
   * Halaman ini dapat diakses tanpa token (tambahkan pengecualian di `middleware/auth.global.ts`).
   * Tampilkan pesan dorongan (*nudge*): "Login untuk menyimpan sesi belajar dan berinteraksi dengan AI Companion!" dengan tombol CTA menuju `/login`.
2. **Pembaruan State Pinia (`stores/timer.ts`):**
   * *State:* `timeLeft` (detik), `isRunning`, `currentSessionId`.
   * *Logika Hibrida:*
     * Saat timer dimulai, cek ketersediaan token di `auth.ts`.
     * **Jika tidak ada token (Guest):** Jalankan hitung mundur secara lokal menggunakan `@vueuse/core` tanpa memanggil API.
     * **Jika ada token (Logged In):** Panggil `POST /api/sessions`, simpan `id`, lalu mulai hitung mundur. Saat selesai, panggil `PUT /api/sessions/{id}`.

## Langkah 2: Komponen UI PomodoroTimer (`components/PomodoroTimer.vue`)
*Catatan Desain:*
- **Tipografi Timer:** Gunakan teks tebal untuk angka (contoh: `text-[120px] font-extrabold text-stone-900 leading-none`).
- **Kontainer Utama:** `flex flex-col items-center justify-center bg-white rounded-3xl border-2 border-orange-500 p-8 shadow-md`.
- **Kontrol:** Baris tombol (Play, Pause, Reset/Stop) menggunakan `flex gap-4`.

## Langkah 3: Layout Dashboard & Mood Check-in (Terproteksi)
Fitur ini hanya untuk pengguna yang telah login.

1. **Layout Khusus (`layouts/dashboard.vue`):**
   * Buat struktur navigasi (Sidebar/Bottom Bar) berisi tautan ke Timer (`/dashboard`), AI Chat (`/chatbot`), Statistik (`/gamification/stats`), dan Pengaturan (`/settings`).
2. **Sistem Mood Check-in (`stores/survey.ts` & `components/MoodSurveyModal.vue`):**
   * Buat *action* untuk `GET /api/surveys/today` dan `POST /api/surveys/mood`.
   * Di `/pages/dashboard.vue`, cek data *mood* hari ini saat halaman dimuat. Jika `null`, paksa tampilkan modal form survei.
   * **Pilihan Mood:** Buat 5 tombol pilihan yaitu **Energetic, Balanced, Tired, Overwhelmed, Distracted**. 
   * **Aturan Visual Wajib:** **JANGAN menggunakan emoji bawaan sistem (teks).** Anda wajib menggunakan komponen ikon dari `@nuxt/icon` atau file SVG untuk merepresentasikan masing-masing mood (misal: ikon petir untuk Energetic, timbangan untuk Balanced, baterai lemah untuk Tired).
   * Modal baru tertutup setelah berhasil disubmit ke API.
3. **Integrasi Timer di Dashboard:**
   * Letakkan komponen `PomodoroTimer.vue` yang sudah dibuat di dalam `/pages/dashboard.vue`. Karena pengguna sudah login, logika API di *store* timer akan otomatis berjalan.

## Langkah 4: Halaman Retrival Gamifikasi (`/pages/gamification/stats.vue`)
1. Buat `stores/gamification.ts` untuk memanggil `GET /api/gamification/stats`.
2. Tampilkan metrik menggunakan *BaseCard*:
   * **Streak:** Tampilkan ikon api (`text-orange-500` via `@nuxt/icon`) dan angka `current_streak`.
   * **Total Focus Time:** Tampilkan ikon jam/waktu dan total menit fokus.