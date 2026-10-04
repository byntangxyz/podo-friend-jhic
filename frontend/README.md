# PodoFriend - Frontend

**PodoFriend** adalah aplikasi web pendamping belajar pintar berbasis AI yang dirancang untuk mencegah *burnout* mahasiswa dan pelajar menggunakan **Teknik Pomodoro**, pelacak kondisi emosional harian, sistem gamifikasi, dan asisten AI interaktif dengan empati kontekstual tinggi.

Aplikasi ini dibangun menggunakan **Nuxt 4**, **Vue 3**, **Tailwind CSS**, **Pinia**, serta **Nitro Server Streaming** dengan integrasi **LangChain**.

---

## Prasyarat Sistem

Sebelum memulai, pastikan perangkat Anda telah terpasang:
- **Node.js**: Versi `18.x` atau `20.x` (LTS disarankan)
- **Package Manager**: `pnpm` (disarankan), `npm`, atau `yarn`
- **Backend API**: Server backend Laravel PodoFriend berjalan di `http://localhost:8000`

---

## Panduan Instalasi & Setup

### 1. Kloning & Instal Dependensi
```bash
# Masuk ke direktori frontend
cd frontend

# Pasang dependensi menggunakan pnpm
pnpm install
```

### 2. Konfigurasi Environment (`.env`)
Salin atau buat file `.env` di dalam folder `frontend/` dengan konfigurasi berikut:

```dotenv
# URL Backend Utama (Laravel API)
NUXT_PUBLIC_API_BASE=http://localhost:8000

# Kredensial AI Gateway (9Router) - Berjalan aman di server Nitro
NUXT_AI_BASE_URL=https://your-9router-url/v1
NUXT_AI_API_KEY=your_9router_api_key_here
NUXT_AI_MODEL=gemini/gemini-3.8-flash
```

---

## Menjalankan Aplikasi

### Mode Pengembangan (Development Server)
```bash
pnpm dev
```
Buka peramban (browser) di alamat: **`http://localhost:3000`**

### Validasi Tipe & Build Produksi
```bash
# Validasi tipe TypeScript
pnpm typecheck

# Build bundle produksi (SSR / Nitro Server)
pnpm build

# Preview hasil build lokal
pnpm preview
```

---

## Panduan Penggunaan Fitur Utama

### 1. Autentikasi Pengguna
- **Daftar Akun Baru:** Buka rute `/register` dan masukkan nama, email, serta kata sandi.
- **Masuk (Login):** Buka rute `/login`. Setelah berhasil login, token autentikasi disimpan secara otomatis untuk semua permintaan API berikutnya.

### 2. Survei Mood Harian (Daily Mood Check-in)
- Saat membuka **Dashboard** (`/dashboard`), jika Anda belum mengisi kondisi mood hari ini, modal survei mood akan muncul secara otomatis.
- Pilih salah satu status emosi:
  - ⚡ **Energetic**: Bersemangat dan siap fokus.
  - ⚖️ **Balanced**: Kondisi tenang, stabil, dan seimbang.
  - 🔋 **Tired**: Lelah, lemas, butuh ritme santai.
  - ⛈️ **Overwhelmed**: Kewalahan atau panik menghadapi tugas.
  - 🧭 **Distracted**: Perhatian mudah buyar atau tergoda gadget.
- Kondisi mood ini digunakan oleh Podo untuk menyesuaikan saran timer serta nada bicara asisten AI.

### 3. Pomodoro Focus Timer
- Buka menu **Timer Fokus** di Dashboard (`/dashboard`).
- Pilih siklus yang diinginkan:
  - **Fokus**: Sesi kerja 25 menit.
  - **Istirahat Pendek**: Jeda santai 5 menit.
  - **Istirahat Panjang**: Istirahat pemulihan 15 menit setelah menyelesaikan 4 siklus fokus.
- Gunakan tombol **Mulai (Start)**, **Jeda (Pause)**, **Reset**, atau **Lewati (Skip)** sesuai kebutuhan belajarmu.

### 4. PodoChat - AI Companion Anti-Burnout (`/chatbot`)
- Akses melalui tombol **AI Chat** di navigasi atas atau buka `/chatbot`.
- **Fitur Multi-Sesi:**
  - Klik **"Chat Baru"** di sidebar sebelah kiri untuk membuat sesi obrolan baru.
  - Sesi obrolan lama akan tersimpan di daftar riwayat sidebar dan dapat dibuka kembali kapan saja.
  - Gunakan fitur **Cari Obrolan** untuk menyaring riwayat berdasarkan judul atau cuplikan pesan.
- **Streaming Response:**
  - Ketik pesan atau gunakan tombol saran cepat (*quick prompts*).
  - Podo akan merespons secara instan kata demi kata (*real-time typing stream*).
- **Vocabulary Bank & Deteksi Emosi:**
  - Podo membaca bahasa gaul dan kata kunci emosi pengguna (misal: *"capek banget"*, *"gaspol"*, *"pusing deadline"*).
  - Jika Anda sedang lelah, Podo memberikan validasi empati dan tips peregangan tanpa rasa bersalah (*anti-guilt*).
- **Pengaturan Kepribadian AI:**
  - Klik tombol **Personalitas** di sidebar untuk mengubah gaya komunikasi Podo:
    1. *Empatik & Mendukung* (Hangat & menenangkan)
    2. *Tegas & Disiplin* (Fokus target & ketepatan waktu)
    3. *Santai & Bersahabat* (Gaya kawan sebaya)
    4. *Penyemangat & Energik* (Antusias & bersemangat)

### 5. Gamifikasi & Progres Belajar (`/gamification/stats`)
- Pantau pencapaian belajar melalui menu **Progress & Gamifikasi**.
- Lihat total menit fokus yang terkumpul, sesi selesai, pencapaian *Daily Streak*, dan lencana prestasi (*badges*).

---

## Dokumentasi Teknis & Serah Terima (Handover)

Bagi pengembang yang ingin memahami detail teknis arsitektur, integrasi Nitro Server, kontrak API backend, dan state management, silakan merujuk ke berkas dokumentasi lengkap:
👉 [collaboration_docs/FRONTEND_HANDOVER_DOCUMENTATION.md](./collaboration_docs/FRONTEND_HANDOVER_DOCUMENTATION.md)
