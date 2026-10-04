# Instruksi Refaktor Phase 3 - Migrasi LangChain Node.js ke Nuxt 4 (Nitro Server & Streaming)

**Konteks Masalah:**
Respons AI saat ini terasa sangat lambat karena menggunakan metode _blocking_ (menunggu seluruh teks selesai sebelum dirender). Selain itu, kita memiliki kode referensi LangChain Node.js yang sudah dikalibrasi dan perlu diintegrasikan langsung ke dalam ekosistem Nuxt 4.
Tugas Anda adalah memindahkan logika Node.js tersebut ke dalam Nuxt Server Routes (Nitro) dan mengaktifkan respons _Streaming_ agar UI terasa instan dan responsif.

---

## Langkah 1: Pindahkan Logika Node.js ke Nuxt Server Route

Jangan jalankan LangChain langsung di _client-side_ (Vue). Selain lambat, ini akan mengekspos API Key (seperti key 9router) ke publik. Gunakan fitur _server_ bawaan Nuxt.

1. **Instalasi Dependencies di Nuxt:**
   Pastikan _package_ LangChain terinstal di proyek Nuxt Anda:
   `npm install @langchain/openai @langchain/core` (Sesuaikan dengan library yang dipakai di repositori teman pengguna, biasanya menggunakan wrapper OpenAI untuk 9router).
2. **Buat Endpoint Server Nuxt (`server/api/ai/chat.post.ts`):**

- Pindahkan logika inisialisasi model LLM (contoh: `ChatOpenAI` dengan base URL 9router) dari kode Node.js teman pengguna ke dalam file ini.
- Pastikan parameter `temperature` (misal: 0.7) dan API Key diambil dari `process.env` atau `useRuntimeConfig()`.

## Langkah 2: Implementasi Streaming di Server Route

Ubah metode pemanggilan LangChain agar mengembalikan aliran data (stream) alih-alih menunggu _promise_ selesai secara penuh.

1. **Logika Stream di `server/api/ai/chat.post.ts`:**

- Tangkap `messages`, `todayMood`, dan `chatbotPersonality` dari `readBody(event)`.
- Susun array pesan (`SystemMessage`, `HumanMessage`, `AIMessage`).
- Gunakan metode `.stream()` dari LangChain LLM.
- Kembalikan respons menggunakan utilitas Nuxt/Nitro untuk streaming (misal: `sendStream` atau kembalikan instance `ReadableStream` langsung).
- _Referensi Logika:_
  Gunakan `HttpResponse` atau konversi chunk LangChain menjadi respons _Server-Sent Events_ (SSE) atau _teks stream_ agar frontend bisa membacanya sepotong-sepotong.

## Langkah 3: Penyesuaian Frontend (Mengkonsumsi Stream)

UI `/chatbot` harus diperbarui agar bisa merender teks yang masuk secara bertahap (efek mengetik instan).

1. **Update Action di `stores/chat.ts` (Fungsi Generate):**

- Ganti penggunaan `$fetch` biasa (yang memblokir) dengan Web Fetch API bawaan browser (`window.fetch`) agar kita bisa membaca `response.body.getReader()`.
- **Alur Stream:**

1. Buat objek pesan AI kosong di array `messages` lokal dengan teks `""` dan `isLoading = true`.
2. Lakukan `fetch` ke `/api/ai/chat`.
3. Baca _stream_ menggunakan `reader.read()`. Setiap kali ada _chunk_ (potongan teks) baru yang diterima, tambahkan (append) ke properti teks pada pesan AI tersebut. UI akan otomatis memperbarui tampilan seolah-olah AI sedang mengetik.
4. Setelah `done: true` tercapai, ubah `isLoading = false`.

5. **Sinkronisasi ke Backend Utama (Laravel):**

- Ingat! Nuxt Server Route (`/api/ai/chat`) HANYA bertugas memproses LLM dan mengembalikan teks.
- Setelah proses _streaming_ di _frontend_ benar-benar selesai (langkah 1.4), _frontend_ **WAJIB** mengambil hasil teks final tersebut dan mengirimkannya ke backend Laravel via `POST http://localhost:8000/api/chat-sessions/{session_id}/messages` untuk disimpan secara permanen.

## Langkah 4: Keamanan Kredensial

- Masukkan API Key (9router/OpenAI) ke dalam file `.env` di proyek Nuxt (contoh: `NUXT_API_KEY=xxx`).
- Daftarkan di `nuxt.config.ts` pada bagian `runtimeConfig: { apiKey: process.env.NUXT_API_KEY }`.
- Jangan letakkan _key_ ini di bagian `public`, agar sepenuhnya aman di sisi server Nitro Nuxt.
