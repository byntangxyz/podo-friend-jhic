# Instruksi Pengembangan Frontend - PodoFriend (Phase 1: Pondasi & Autentikasi)

**Konteks Sistem:**
Anda adalah AI Developer Agent spesialis Frontend menggunakan Nuxt 4, Vue 3, dan Tailwind CSS. Tugas Anda saat ini adalah mengeksekusi **Phase 1** dari pengembangan aplikasi PodoFriend (Anti-Burnout Focus & Study Companion). Backend Laravel 12 sudah siap sedia di `http://localhost:8000`.

**Tujuan Phase 1:**
Membangun fondasi proyek, mengonfigurasi standar desain global, membuat _state management_ autentikasi, serta menyelesaikan halaman Publik dan Autentikasi.

---

## Langkah 1: Inisialisasi Proyek & Konfigurasi Global

1. **Setup Proyek & Dependencies:**

- Inisialisasi proyek Nuxt 4.
- Instal modul wajib: `@nuxtjs/tailwindcss`, `@pinia/nuxt`, `@pinia-plugin-persistedstate/nuxt`, dan `zod`.

2. **Konfigurasi Tailwind CSS (`tailwind.config.js`):**

- Tambahkan konfigurasi warna khusus agar sesuai desain:
- `background`: `orange-50` (#FFF7ED)
- `primary`: `orange-500` (#F97316)
- `text-dark`: `stone-900` (#1C1917)
- `bubble-ai`: `gray-100` (#F3F4F6)

- Set _font family_ default ke sans-serif yang membulat/ramah.

3. **Global Layout (`app.vue` & `layouts/default.vue`):**

- Pastikan elemen `body` menggunakan kelas `bg-orange-50 text-stone-900 min-h-screen font-sans`.

---

## Langkah 2: Pembuatan Komponen UI Global

Buat komponen _reusable_ berikut di folder `components/` sesuai standar UI Figma:

1. **`BaseButton.vue`**

- **Style:** Latar `bg-orange-500`, teks putih `font-bold`, sudut `rounded-full` atau `rounded-2xl`, efek `hover:bg-orange-600 transition-colors`.
- **Props:** Menerima `type` (submit/button), `disabled` status, dan slot untuk teks.

2. **`BaseCard.vue`**

- **Style:** Latar `bg-white` atau `bg-orange-50`, sudut sangat melengkung `rounded-3xl`, garis tepi `border-2 border-orange-500`, dan bayangan `shadow-md`.

3. **`BaseInput.vue`**

- **Style:** Input form dengan latar terang, `rounded-xl`, garis tepi tipis yang berubah menjadi `focus:border-orange-500 focus:ring-1 focus:ring-orange-500` saat aktif.
- **Props:** `modelValue`, `label`, `type`, `placeholder`, dan `error` (untuk menampilkan pesan validasi Zod).

---

## Langkah 3: Utilitas API & State Management

1. **Composable API Fetcher (`composables/useApiFetch.ts`):**

- Buat _wrapper_ dari `$fetch` bawaan Nuxt.
- **Base URL:** Arahkan ke `http://localhost:8000`.
- **Headers:** Otomatis sisipkan `Accept: application/json` dan `Authorization: Bearer {token}` (ambil token dari Pinia auth store).

2. **Pinia Auth Store (`stores/auth.ts`):**

- Buat _store_ untuk menyimpan `user` (objek) dan `token` (string).
- Gunakan `pinia-plugin-persistedstate` agar `token` tersimpan di _localStorage_ atau _cookie_.
- Buat _actions_ untuk:
- `setToken(token)`
- `setUser(user)`
- `logout()`: Menghapus data state dan token lokal.

---

## Langkah 4: Implementasi Halaman (Pages)

1. **Landing Page (`pages/index.vue`):**

- Halaman statis sederhana berisi Hero Title ("Anti-Burnout Focus & Study Companion"), deskripsi singkat, dan dua `BaseButton` yang mengarah ke `/login` dan `/register`.

2. **Halaman Register (`pages/register.vue`):**

- Gunakan `BaseCard` di tengah layar.
- Buat form menggunakan `BaseInput` untuk: `name`, `email`, `password`, dan `password_confirmation`.
- **Validasi Zod:** Nama wajib, email valid, password min 8 karakter dan match.
- **Integrasi API:** Lakukan `POST /api/auth/register`. Jika sukses (201), simpan token & user ke store, lalu _redirect_ ke `/dashboard`.

3. **Halaman Login (`pages/login.vue`):**

- Gunakan `BaseCard`.
- Buat form untuk: `email` dan `password`.
- **Integrasi API:** Lakukan `POST /api/auth/login`. Jika gagal (401), tampilkan pesan error. Jika sukses (200), simpan token & user ke store, lalu _redirect_ ke `/dashboard`.

---

## Langkah 5: Proteksi Rute (Route Middleware)

1. **Global Auth Middleware (`middleware/auth.global.ts`):**

- Cek keberadaan `token` di Pinia store.
- Jika pengguna **tidak memiliki token** dan mencoba mengakses rute selain `/`, `/login`, atau `/register`, _redirect_ paksa ke `/login`.
- Jika pengguna **memiliki token** dan mencoba mengakses `/login` atau `/register`, _redirect_ paksa ke `/dashboard`.

---

**Instruksi Eksekusi untuk AI:**
Harap kerjakan semua file di atas secara berurutan. Pastikan kode yang Anda hasilkan bersih, menggunakan Vue 3 Composition API (`<script setup>`), dan secara ketat menerapkan kelas Tailwind yang telah didefinisikan agar UI tidak melenceng dari desain. Jika ada _error handling_ dari API (422 Unprocessable Entity), pastikan pesan error tersebut tertangkap dan ditampilkan pada UI form.
