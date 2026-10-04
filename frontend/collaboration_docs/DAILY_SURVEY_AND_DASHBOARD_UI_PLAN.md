# Rencana Implementasi: Daily Survey Horizontal, Dashboard Alignment, & Perbaikan UI

Dokumen ini merangkum rencana arsitektur dan eksekusi antarmuka untuk:
1. **Daily Survey Modal (`MoodSurveyModal.vue`)**: Transformasi tata letak dari vertikal ke horizontal dan migrasi aset ke SVG resmi dari `.agent/docs/assetDailySurvey/`.
2. **Gamification Stats (`gamification/stats.vue:190:14`)**: Penyesuaian warna teks rank #1 menjadi putih (`text-white`).
3. **Dashboard Alignment (`dashboard.vue:81:4`)**: Penjajaran kartu header selamat datang & status mood agar sejajar di tengah bersama Pomodoro Timer.
4. **Pomodoro Timer Sizing (`PomodoroTimer.vue:42:4`)**: Optimalisasi ketinggian vertikal kartu timer agar AI Companion langsung terlihat di layar tanpa perlu *scrolling*.
5. **Penyempurnaan Bahasa (Copywriting)**: Memperbaiki bahasa Indonesia yang kaku menjadi hangat, ramah, dan memotivasi pelajar.

---

## 1. Analisis Ketergantungan Kode (Cross-Component Dependencies)

Sebelum mengubah kode, dilakukan pelacakan pemanggilan di seluruh halaman dan komponen:

| File / Komponen Target | Lokasi Pemanggilan Lain | Risiko Regresi | Strategi Mitigasi |
| :--- | :--- | :--- | :--- |
| **`MoodSurveyModal.vue`** | `pages/dashboard.vue`<br>`pages/chatbot.vue`<br>`pages/index.vue` | Komponen tidak menerima props (`props: none`). Berinteraksi via `surveyStore.showModal` & `surveyStore.submitMood`. Nilai mood dikirim ke backend Laravel & server Nitro (`todayMood`). | Tetap gunakan ID mood baku (`Energetic`, `Distracted`, `Tired`, `Overwhelmed`) agar kompatibel 100% dengan `vocabularyBank.ts`, database, dan analisis emosi AI, sembari menampilkan visual SVG dan teks bahasa Indonesia yang ramah. |
| **`dashboard.vue`** | Router `/dashboard` | Menampilkan widget `surveyStore.todaySurvey` dan Pomodoro timer. Posisi header mempengaruhi *flow* layout grid desktop & mobile. | Pindahkan kontainer header selamat datang ke dalam kolom utama timer (`flex-1 w-full max-w-4xl`), sehingga lebarnya menyatu dan sejajar presisi dengan kartu timer Pomodoro di semua ukuran layar desktop maupun tablet. |
| **`PomodoroTimer.vue`** | `pages/dashboard.vue` | Terhubung dengan `useTimerStore()`, `useAuthStore()`, dan `AppMascot.vue`. Memancarkan event modal perayaan sesi selesai. | Pertahankan seluruh fungsi timer, tombol, dan state machine maskot. Hanya rapikan *scale* angka, margin padding (`p-10` $\to$ `p-5`, gap `my-6` $\to$ `my-3`), dan ukuran tombol kontrol agar total tinggi berkurang ~250px. |
| **`gamification/stats.vue`** | Router `/gamification/stats` | Mengonsumsi `gamificationStore.dailyLeaderboard`. | Berikan conditional class `:class="item.rank === 1 ? 'text-white' : 'text-stone-900'"` pada judul dan subteks baris peringkat pertama. |

---

## 2. Rincian Rencana Perubahan

### A. Daily Survey Modal (`app/components/MoodSurveyModal.vue`)
- **Aset SVG**: Salin aset dari `.agent/docs/assetDailySurvey/` ke `public/surveys/`:
  - `dailySurveySangatfokus.svg` $\to$ Mood: `Energetic` (Sangat Fokus)
  - `dailySurveyKurangfokus.svg` $\to$ Mood: `Distracted` (Kurang Fokus)
  - `dailySurveyLelah.svg` $\to$ Mood: `Tired` (Lelah)
  - `dailySurveyKewalahan.svg` $\to$ Mood: `Overwhelmed` (Kewalahan)
- **Transformasi Layout Horizontal**:
  - Ubah kontainer modal menjadi lebih lebar dan lega (`max-w-2xl sm:max-w-3xl`).
  - Ganti susunan vertikal `space-y-2.5` menjadi horizontal grid `grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4`.
  - Tiap kartu mood menampilkan ilustrasi maskot SVG dari `assetDailySurvey` dengan rasio proporsional, indikator checkmark ketika dipilih, serta ring seleksi `ring-3 ring-orange-500 border-orange-400 bg-orange-50/80 shadow-md scale-102`.
- **Copywriting**:
  - Judul: *"Kabar Hatimu Hari Ini"*
  - Subjudul: *"Bagaimana perasaanmu sebelum mulai belajar? Podo akan menyesuaikan ritme belajar agar kamu tetap nyaman."*
  - Tombol CTA: *"Mulai Belajar Bareng Podo"*
  - Catatan bawah: *"Check-in harian membantumu menjaga ritme belajar yang sehat dan seimbang."*

### B. Gamification Leaderboard Rank #1 (`app/pages/gamification/stats.vue:190:14`)
- Pada baris `item.rank === 1`, terapkan warna teks putih bersih:
  - Judul hari/tanggal (line 190): `:class="item.rank === 1 ? 'text-white' : 'text-stone-900'"`
  - Subjudul total durasi & sesi (line 193): `:class="item.rank === 1 ? 'text-white/90' : 'text-stone-600'"`
  - Pill badge peringkat (line 199): `:class="item.rank === 1 ? 'bg-white/25 text-white' : 'bg-white/50 text-stone-700'"`

### C. Penjajaran Dashboard Header (`app/pages/dashboard.vue:81:4`)
- **Masalah Saat Ini**: Header sambutan selamat datang berada di luar susunan kolom flex, membentang selebar layar penuh menutupi area `TaskList` dan `PomodoroTimer`, sehingga tampak tidak sejajar dengan kartu Pomodoro.
- **Solusi**: Pindahkan blok header sambutan (`line 81-140`) ke dalam kontainer kolom kanan (`flex-1 w-full max-w-4xl flex flex-col gap-6`).
- **Hasil**: Header sambutan dan Pomodoro Timer memiliki lebar maksimal yang identik (`max-w-4xl`) dan sejajar di tengah secara simetris, berdampingan rapi dengan `TaskList` di sisi kiri pada layar lebar.

### D. Optimasi Ketinggian Pomodoro Timer (`app/components/PomodoroTimer.vue:42:4`)
- **Masalah Saat Ini**: Ketinggian kartu timer mencapai >700px karena padding `p-10`, angka timer `text-[130px]`, margin tombol `my-6`, dan tombol kontrol raksasa (`w-24 h-24`), sehingga pengguna harus menggulir layar (*scroll*) hanya untuk melihat maskot AI Companion di bagian bawah.
- **Optimalisasi Sizing**:
  - Padding kartu: kurangi dari `p-6 sm:p-10` menjadi `p-5 sm:p-7`.
  - Mode Switcher: margin diperkecil dari `mb-6` menjadi `mb-3`.
  - Angka Timer: disesuaikan ke `text-6xl sm:text-7xl md:text-8xl` dengan padding `py-2` (tetap tebal, gagah, dan sangat mudah dibaca).
  - Tombol Kontrol: tombol Play/Pause dioptimalkan ke `w-16 h-16 sm:w-18 sm:h-18` (border-4), tombol Reset & Lewati ke `w-12 h-12 sm:w-14 sm:h-14`, dengan margin `my-3 sm:my-4`.
  - Tombol CTA "Selesaikan Sesi": tinggi dioptimalkan dengan padding `py-3 px-6 text-base sm:text-lg`.
  - Area Maskot Companion: pembatas `mt-4 pt-4`, avatar maskot `w-14 h-14 sm:w-16 sm:h-16`, gelembung bicara proporsional.
- **Hasil**: Seluruh kartu timer beserta AI Companion tampil utuh dalam satu layar (viewport 720p/768p) tanpa perlu *scrolling*.

### E. Perbaikan Bahasa Indonesia yang Alami & Menyenangkan
- **Dialog Podo Companion**:
  - Idle: *"Halo! Aku Podo, teman belajarmu. Yuk, mulai fokus bareng!"*
  - Berjalan: *"Keren banget! Tetap fokus ya, selesaikan satu per satu dulu."*
  - Istirahat: *"Saatnya rehat sejenak! Tarik napas, regangkan badan, dan minum air putih."*
  - Dijeda: *"Sesi dijeda sebentar. Kalau sudah siap, yuk lanjut lagi!"*
- **Teks Dashboard**:
  - *"Semangat Belajar, [Nama]!"*
  - *"Podo siap menemani sesi belajarmu agar tetap fokus dan menyenangkan."*
  - *"Kondisi Hari Ini"* & tombol *"Ganti"* / *"Check-in Perasaan Hari Ini"*.
- **Teks Statistik & Gamifikasi**:
  - *"Luar biasa! Konsistensi belajarmu sangat baik..."*
  - *"Daftar hari-hari paling produktifmu selama sebulan terakhir."*
  - *"Pencatatan waktu belajar diperbarui otomatis setelah setiap sesi Pomodoro selesai."*

---

## 3. Langkah Pelaksanaan (Execution Checklist)

- [ ] **Langkah 1**: Salin file SVG survei dari `.agent/docs/assetDailySurvey/` ke `public/surveys/`.
- [ ] **Langkah 2**: Perbarui `app/components/MoodSurveyModal.vue` menjadi layout horizontal dengan aset SVG dan copywriting natural.
- [ ] **Langkah 3**: Perbarui `app/pages/gamification/stats.vue:190:14` agar rank #1 memiliki teks berwarna putih (`text-white`).
- [ ] **Langkah 4**: Pindahkan dan sejajarkan header di `app/pages/dashboard.vue` agar sejajar presisi di kolom tengah bersama Pomodoro Timer.
- [ ] **Langkah 5**: Kompakkan ukuran di `app/components/PomodoroTimer.vue` agar AI Companion terlihat tanpa *scroll*, serta perbaiki teks dialog Podo.
- [ ] **Langkah 6**: Validasi TypeScript (`pnpm typecheck` / linting) dan periksa tampilan aplikasi secara visual.
