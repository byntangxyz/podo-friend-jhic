# Rencana Implementasi: Survey Step 2 (Mode Belajar), Preferensi Dashboard, Alarm Timer, & Break Wajib

Dokumen ini merangkum analisis arsitektur, rencana modul, dan langkah eksekusi untuk 4 fitur baru pada PodoFriend:
1. **Survey Step 2 (`MoodSurveyModal.vue`)**: Setelah memilih mood di Step 1 ("Yuk belajar!"), modal lanjut ke Step 2 memilih durasi belajar menggunakan 3 kartu SVG (`pilihModeCepat.svg`, `pilihModeNormal.svg`, `pilihModeLambat.svg`), serta mengonfigurasi timer Pomodoro secara otomatis.
2. **Widget Preferensi Belajar Dashboard (`dashboard.vue`)**: Mengubah widget status kondisi hari ini menjadi tampilan "Preferensi Belajar" dengan gaya sederhana, bersih, dan ringkas.
3. **Audio Alarm Timer Habis (`useTimerSound` & Placeholder)**: Menyiapkan placeholder file audio `/sounds/timer-alarm.mp3` dengan fallback audio chime Web Audio API yang berbunyi saat waktu fokus/istirahat habis.
4. **Sistem Break Wajib (Mandatory Break Rule)**: Mencegah pengguna melewatkan sesi istirahat setelah menyelesaikan sesi fokus secara penuh. Pengguna wajib menjalani waktu istirahat sebelum dapat memulai sesi fokus baru.

---

## 1. Analisis Ketergantungan Kode (Cross-Component Dependencies)

| Komponen / Modul | Berkas Terkait | Dampak Perubahan | Mitigasi & Kompatibilitas |
| :--- | :--- | :--- | :--- |
| **`MoodSurveyModal.vue`** | `stores/survey.ts`<br>`stores/timer.ts`<br>`pages/dashboard.vue`<br>`pages/chatbot.vue` | Menjadi modal multi-langkah (Step 1: Mood, Step 2: Mode Belajar). | Tetap menjaga pemanggilan `surveyStore.submitMood` ke backend Laravel. Menambahkan sinkronisasi durasi timer ke `timerStore.setStudyMode(mode)` dan `localStorage`. |
| **`dashboard.vue`** | `MoodSurveyModal.vue`<br>`stores/survey.ts`<br>`stores/timer.ts` | Widget di baris sambutan menampilkan preferensi belajar (Mode terpilih & Mood harian). | Menggunakan style card flat/pill yang sederhana dan minimalis, dengan tombol "Ganti" untuk membuka kembali survey. |
| **`PomodoroTimer.vue`** | `stores/timer.ts`<br>`AppMascot.vue` | Timer menerima durasi sesuai mode, memutar audio saat hitungan 00:00, dan mengunci tombol jika sedang dalam status *break wajib*. | Menambahkan audio alarm trigger pada transisi waktu habis, menonaktifkan switcher mode fokus dan tombol lewati saat `isBreakMandatory === true`. |
| **`stores/timer.ts`** | Seluruh dashboard | Pusat *state* timer, durasi mode, audio notification, dan aturan *break wajib*. | Menambahkan state `studyMode: 'cepat' \| 'normal' \| 'lambat'`, `isBreakMandatory: boolean`, durasi kustom per mode, serta aksi `setStudyMode()`. |

---

## 2. Rincian Teknis Pelaksanaan

### A. Survey Step 2 di `MoodSurveyModal.vue`
- **Alur Multi-Step**:
  - `currentStep = ref<1 | 2>(1)`
  - **Step 1 (Cek Kondisi Perasaan)**:
    - User memilih salah satu dari 4 mood: *Sangat Fokus*, *Kurang Fokus*, *Lelah*, *Kewalahan*.
    - Tombol "Yuk belajar!" memvalidasi pemilihan mood, lalu mengubah `currentStep.value = 2`.
  - **Step 2 (Pilih Mode & Durasi Belajar)**:
    - Judul: *"Mau berapa lama kamu belajar?"*
    - Subjudul: *"Pilih ritme sesi yang paling pas dengan energimu hari ini."*
    - Pilihan Kartu Mode (3 Kartu SVG dari `public/surveys/`):
      1. **Mode Cepat (`pilihModeCepat.svg`)**:
         - Fokus: **15 Menit** | Istirahat: **3 Menit**
         - Cocok untuk tugas ringan atau sedang terburu-buru.
      2. **Mode Normal (`pilihModeNormal.svg`)**:
         - Fokus: **25 Menit** | Istirahat: **5 Menit**
         - Standar Pomodoro ideal untuk pemahaman materi konsisten.
      3. **Mode Lambat (`pilihModeLambat.svg`)**:
         - Fokus: **40 Menit** | Istirahat: **10 Menit**
         - Sesi *deep-work* mendalam untuk materi berat atau pemahaman kompleks.
    - Saat kartu dipilih: diberi *ring* oranye tebal (`ring-3 ring-orange-500 border-orange-400 bg-orange-50/80 shadow-md scale-102`), efek hover, dan tanda centang aktif.
    - Tombol Aksi:
      - Tombol "Kembali" untuk mengubah mood di Step 1.
      - Tombol "Mulai Sesi Belajar!" untuk:
        1. Menyimpan mood ke API backend via `surveyStore.submitMood(selectedMood)`.
        2. Mengatur mode dan durasi timer di `timerStore.setStudyMode(mode)`.
        3. Menutup modal.

### B. Widget Preferensi Belajar di `dashboard.vue:125:12`
- Mengganti tampilan widget lama yang sebelumnya hanya "Kondisi Hari Ini" menjadi **Preferensi Belajar**:
  - Struktur sederhana & bersih:
    - Label ringkas: *"Preferensi Belajar"*
    - Indikator Mode & Waktu: Badge berwarna oranye muda bertuliskan misal: *"Mode Normal (25m Fokus)"* dan pill kondisi *"Sangat Fokus"*.
    - Tombol teks *"Ganti"* untuk membuka kembali modal survei.

### C. Suara Alarm Timer Habis (Audio Notification)
- **Folder & Aset Placeholder**:
  - Membuat direktori `public/sounds/` dan menempatkan file placeholder `timer-alarm.mp3`.
- **Integrasi di `stores/timer.ts` / Composable `useTimerSound`**:
  - Saat hitungan mundur timer mencapai 0 (`this.timeLeft === 0`):
    - Jalankan fungsi `playTimerAlarm()`.
    - Menggunakan objek `new Audio('/sounds/timer-alarm.mp3')`.
    - Dilengkapi **Fallback Web Audio API Synthesizer**: Jika file audio belum diganti oleh pengguna atau browser membatasi autoplay media, synthesizer Web Audio API akan membunyikan nada melodi bertingkat ramah (C5 - G5 - C6) sehingga alarm tetap berbunyi tanpa dependensi berkas luar.

### D. Sistem Break Wajib (Mandatory Break Rule)
- **Aturan Bisnis**:
  - Jika pengguna menyelesaikan sesi fokus (`mode === 'work'`) karena waktu habis secara wajar (`timeLeft === 0`):
    1. Otomatis set `isBreakMandatory = true`.
    2. Alihkan timer ke mode `break` dengan durasi break sesuai mode belajar aktif (3 menit untuk Cepat, 5 menit untuk Normal, 10 menit untuk Lambat).
    3. Tampilkan pesan dialog Podo: *"Hebat! Waktu fokus selesai. Sekarang kamu wajib istirahat sejenak untuk memulihkan energimu ya!"*.
  - **Larangan Selama Break Wajib**:
    - Tombol switcher "Fokus" dinonaktifkan (`disabled:opacity-50 disabled:cursor-not-allowed`) dengan keterangan bahwa istirahat wajib dijalani.
    - Tombol "Lewati / Skip" dinonaktifkan.
    - Pengguna tidak diperbolehkan mengulang sesi fokus sebelum sesi break selesai dihitung mundur atau diselesaikan.
  - Setelah sesi istirahat selesai (`timeLeft === 0` pada mode break) atau user menyelesaikan break:
    - Set `isBreakMandatory = false`.
    - Mode kembali ke `work`, siap untuk sesi fokus berikutnya.

---

## 3. Langkah Pelaksanaan (Execution Checklist)

- [ ] **Langkah 1**: Perbarui `app/stores/timer.ts` untuk mendukung `studyMode` (cepat, normal, lambat), durasi dinamis, audio alarm placeholder/synth, dan sistem `isBreakMandatory`.
- [ ] **Langkah 2**: Buat placeholder audio di `public/sounds/timer-alarm.mp3`.
- [ ] **Langkah 3**: Ubah `app/components/MoodSurveyModal.vue` menjadi 2 langkah (Step 1: Mood, Step 2: Mode Belajar 3 Kartu SVG) dan sinkronisasi ke timer.
- [ ] **Langkah 4**: Perbarui widget di `app/pages/dashboard.vue` menjadi tampilan "Preferensi Belajar" sederhana dan rapi.
- [ ] **Langkah 5**: Sesuaikan `app/components/PomodoroTimer.vue` agar menerapkan status `isBreakMandatory` (disable tombol fokus/skip) dan sinkronisasi durasi mode.
- [ ] **Langkah 6**: Validasi TypeScript (`pnpm typecheck`) dan pengujian visual di browser.
