# Dokumen Spesifikasi Frontend (Nuxt 4) - PodoFriend App (Update Desain)
**Konteks Sistem:** Anda adalah AI Developer Agent spesialis Frontend Web Development menggunakan Nuxt 4 dan Vue 3. Tugas Anda adalah membangun antarmuka pengguna (UI) dan logika *client-side* untuk aplikasi "PodoFriend", sebuah *Anti-Burnout Focus & Study Companion*. *Backend* (Laravel 12 RESTful API) sudah beroperasi penuh.

---

## 1. Visi & Arsitektur Produk
- **Produk:** PodoFriend memadukan teknik Pomodoro dengan agen AI (AI Companion) yang peduli pada kondisi mental (*mood*) pengguna untuk mencegah *burnout*.
- **Arsitektur:** *Headless* arsitektur. Nuxt 4 akan bertindak sebagai *client* yang mengonsumsi RESTful API Laravel, dan **pemrosesan AI (LLM) dijalankan langsung di lingkungan Nuxt menggunakan LangChain + 9router**.

## 2. Tech Stack & Dependencies
- **Framework Utama:** Nuxt 4 (Vue 3, Composition API, `<script setup>`).
- **Styling:** `@nuxtjs/tailwindcss` (Tailwind CSS).
- **State Management:** `@pinia/nuxt` & `@pinia-plugin-persistedstate/nuxt`.
- **Form & Validasi:** `zod` terintegrasi dengan komponen form.
- **AI & Integrasi:** LangChain + 9router.
- **Utilitas:** `@vueuse/core` (untuk timer presisi) dan `date-fns`.
- **Ikon & Animasi:** `@nuxt/icon` dan `vue3-lottie` (atau rendering SVG/gambar statis untuk aset mascot awal).

## 3. Desain Sistem, Aset Visual, & Panduan UI/UX
Berdasarkan referensi *mockup* UI terbaru, desain aplikasi memiliki gaya *playful*, *clean*, dengan elemen dominan membulat (rounded) dan menggunakan identitas visual maskot khusus[cite: 6].

### A. Palet Warna (Color Styles)
Warna aplikasi bernuansa oranye monokromatik yang hangat. Konfigurasikan file `tailwind.config.js` Anda dengan variabel warna berikut yang terlihat pada panel *Styles* di desain[cite: 6]:
- **Background Color:** Krem pucat/Off-white (Gunakan Tailwind `orange-50` atau `#FFF7ED`). Digunakan untuk latar belakang utama halaman[cite: 6].
- **Primary Color:** Oranye Cerah (Gunakan Tailwind `orange-500` atau `#F97316`). Digunakan untuk tombol utama, sorotan kartu, elemen *timer*, pinggiran (*border*), dan ilustrasi maskot[cite: 6].
- **Text Color:** Hitam/Abu-abu Sangat Gelap (Gunakan Tailwind `stone-900` atau `#1C1917` / `#1E1E1E`). Digunakan untuk tipografi teks utama agar kontras[cite: 6].
- **Bubble Color:** Abu-abu Terang (Gunakan Tailwind `gray-100` atau `#F3F4F6`). Digunakan untuk latar belakang *chat bubble* atau area konten sekunder[cite: 6].

### B. Aset Visual & Elemen UI Utama
- **Maskot AI:** Karakter *blob* (gumpalan) berwarna oranye dengan mata dan mulut sederhana[cite: 6]. Maskot ini muncul di berbagai layar, seperti di pojok kartu *survei*, di dalam komponen *timer*, dan sebagai avatar di halaman obrolan[cite: 6]. AI Agent (Anda) harus menyiapkan penempatan komponen gambar/SVG untuk maskot ini.
- **Kartu & Kontainer:** Gunakan sudut yang sangat membulat (misal: `rounded-2xl` atau `rounded-3xl`), *border* tebal dengan warna oranye (`border-primary`), dan bayangan (*shadow*) yang tegas jika diperlukan[cite: 6].
- **Ikonografi:** Gunakan ikon wajah (emotikon minimalis) untuk *mood check-in*, dan ikon solid (api untuk *streak*, piala, *play/pause*) untuk navigasi dan aksi[cite: 6].

## 4. Pemetaan Halaman (Routes) & Integrasi API

### A. Public Routes (Tanpa Autentikasi)
- **`/` (Landing Page):** Halaman statis.
- **`/login` & `/register`:** Form autentikasi (POST ke Laravel API).

### B. Protected Routes (Membutuhkan Token Sanctum via Pinia)

- **`/dashboard` (Halaman Utama / Pomodoro):**
  - **Mood Check-in (Daily Survey):** Menampilkan UI dengan emotikon wajah (Cepat, Normal, Lambat) untuk memilih *mood* harian (POST ke `/api/surveys/mood`)[cite: 6].
  - **Pomodoro Timer:** Antarmuka dengan tipografi jam digital besar (contoh: `25:00`)[cite: 6]. Dikelilingi kontrol *play, pause, stop* (POST/PUT `/api/sessions`). Maskot oranye diletakkan berdekatan dengan timer[cite: 6].

- **`/chatbot` (AI Companion Full Chat):**
  - **Layout:** *Sidebar* di sebelah kiri dengan latar oranye pekat, dan area obrolan utama di sebelah kanan dengan latar krem[cite: 6].
  - **Bubble:** Pesan AI menggunakan avatar maskot oranye dan *bubble* warna krem/putih[cite: 6]. Pesan pengguna menggunakan *bubble* warna oranye atau abu-abu[cite: 6].
  - Terhubung dengan LangChain untuk proses *generate* dan sinkronisasi log via `/api/chat`.

- **`/gamification/stats` (Personal Progress):**
  - Menggabungkan data "Personal Leaderboard" dan "Streak"[cite: 6]. Tampilkan ikon api menyala untuk menandakan *streak* pengguna[cite: 6].
  - *Catatan:* UI desain menunjukkan bagian *achievement* (pencapaian/badge)[cite: 6], namun untuk MVP ini, abaikan bagian tersebut secara fungsional sesuai batasan PRD. Tampilkan data dari `GET /api/gamification/stats` saja.

- **`/settings` & `/settings/preferences`:**
  - Halaman untuk mengatur preferensi gaya AI (mengakses `PUT /api/user/preferences`).

## 5. Instruksi Logika Khusus untuk AI Agent (Frontend)
1. **Pengelolaan State Timer:** Gunakan Pinia & `@vueuse/core` (`useIntervalFn`) untuk *tick* hitung mundur Pomodoro. Pastikan tipografi angka timer menggunakan *font* yang tebal dan jelas sesuai desain.
2. **Konteks LangChain:** Saat *generate* balasan obrolan, sertakan data *mood* hari ini (dari hasil survei wajah) dan preferensi pengguna.
3. **Data Fetching:** Buat komposabel pembungkus otomatis (seperti `useApiFetch`) yang menangani penyematan `Authorization: Bearer <token>`.