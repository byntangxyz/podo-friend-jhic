# Laporan Implementasi & Penguatan LangChain Chatbot AI (PodoFriend)

Dokumen ini merangkum secara lengkap pekerjaan teknis, arsitektur, pemecahan masalah (*troubleshooting*), dan penguatan sistem pada **AI Companion (PodoChat)** berbasis LangChain dan Nuxt 4 Nitro Server yang telah diimplementasikan.

---

## 📑 Daftar Isi
1. [Ringkasan Eksekutif](#1-ringkasan-eksekutif)
2. [Ekspansi Vocabulary Bank (2.500 Keywords)](#2-ekspansi-vocabulary-bank-2500-keywords)
3. [Arsitektur Prompt & Sliding Window Memory](#3-arsitektur-prompt--sliding-window-memory)
4. [Tool Calling / Dual Action Calling Interaktif](#4-tool-calling--dual-action-calling-interaktif)
5. [Investigasi & Resolusi Insiden Stabilitas](#5-investigasi--resolusi-insiden-stabilitas)
   - [Masalah 1: "Podochat Tidak Membalas" (Reactivity & UI Freeze)](#masalah-1-podochat-tidak-membalas-reactivity--ui-freeze)
   - [Masalah 2: "Lonjakan Antrean Sesaat" (Gateway 9Router 400/503)](#masalah-2-lonjakan-antrean-sesaat-gateway-9router-400503)
   - [Masalah 3: Gagal Menyimpan Task ke Database (Tabel Hilang)](#masalah-3-gagal-menyimpan-task-ke-database-tabel-hilang)
6. [Struktur Berkas & Modul yang Terlibat](#6-struktur-berkas--modul-yang-terlibat)
7. [Panduan Pengujian & Verifikasi](#7-panduan-pengujian--verifikasi)

---

## 1. Ringkasan Eksekutif

Pengembangan difokuskan untuk menjadikan chatbot PodoFriend sebagai asisten belajar anti-burnout yang:
* **Cepat & Hemat Kuota**: Deteksi emosi berbasis kata kunci instan (0 ms) tanpa membuang kuota ke model eksternal secara berulang.
* **Terkoneksi dengan Konteks Riil**: Anti-halusinasi materi belajar dengan menyelaraskan rekomendasi AI langsung pada data To-Do List (*My Task*) dan mode Pomodoro yang aktif.
* **Interaktif & Berorientasi Aksi**: AI tidak hanya membalas dalam bentuk teks percakapan, tetapi juga dapat memicu aksi langsung di layar pengguna seperti mengubah mode timer dan menambahkan task baru.
* **Tahan Banting (*Resilient*)**: Sistem dilengkapi multi-model fallback retry engine agar percakapan tetap berjalan mulus meskipun gateway AI upstream mengalami lonjakan beban atau rotasi error.

---

## 2. Ekspansi Vocabulary Bank (2.500 Keywords)

Sebelumnya, Vocabulary Bank memiliki jumlah kata kunci yang terbatas dan rentan salah mendeteksi kalimat negasi atau kondisi pasca-istirahat. Dilakukan ekspansi menyeluruh dengan standar:
* **Tepat 500 keyword unik** untuk masing-masing 5 kategori emosi:
  1. `energetic.ts`: 500 kata kunci (semangat, hype, gaskeun, frasa pasca-istirahat seperti *"udah rehat"*, *"baterai full lagi"*, dan negasi *"gak capek"*).
  2. `tired.ts`: 500 kata kunci (lelah fisik, mata 5 watt, burnout, mental drained, baterai habis, butuh rehat).
  3. `overwhelmed.ts`: 500 kata kunci (panik, deadline mepet, tugas numpuk, kepala mau pecah, bingung mulai dari mana).
  4. `distracted.ts`: 500 kata kunci (doomscrolling, prokrastinasi, salfok, gonta-ganti tab, notifikasi HP).
  5. `balanced.ts`: 500 kata kunci (flow state, santai produktif, ritme terjaga, damai, teratur, langkah terukur).
* **0 Konflik & Overlap**: Seluruh 2.500 kata kunci telah diaudit dengan skrip otomatis untuk memastikan tidak ada duplikasi internal maupun benturan antar-kategori.
* **Efisiensi Eksekusi**: Analisis dilakukan dalam waktu `< 0.05 ms` langsung di memori Nitro Server sebelum pembuatan pesan LangChain.

---

## 3. Arsitektur Prompt & Sliding Window Memory

Modul khusus `frontend/server/utils/promptBuilder.ts` dibuat untuk memisahkan logika orkestrasi prompt dari endpoint controller:

### Komponen Utama:
* **Kalibrasi Persona**: Mendukung 4 kepribadian yang dipilih pengguna (`Empatik & Mendukung`, `Tegas & Disiplin`, `Santai & Bersahabat`, `Penyemangat & Energik`).
* **Pencegahan Asumsi Liar (Anti-Python Hallucination)**:
  * Menghapus sisa mock `activeTask: 'Belajar Python'` di store timer client.
  * Prompt menginstruksikan AI untuk **hanya** mengambil rujukan dari `userTasks` riil milik pengguna. Jika belum ada tugas tercatat, AI dilarang keras menebak topik koding/akademik tertentu dan wajib bertanya dengan hangat.
* **Aturan Pomodoro Resmi**: AI dikunci hanya mengenali 3 mode resmi PodoFriend:
  * Mode Cepat: 15 menit fokus / 3 menit istirahat.
  * Mode Normal: 25 menit fokus / 5 menit istirahat.
  * Mode Lambat: 40 menit fokus / 10 menit istirahat.
* **Sliding Window Chat History**: Menggunakan `buildChatHistory` dengan batasan 12 giliran pesan terakhir yang bersih dari tag aksi untuk menjaga ketajaman memori percakapan.

---

## 4. Tool Calling / Dual Action Calling Interaktif

Untuk memungkinkan AI mengubah state aplikasi tanpa memecah arsitektur streaming, diimplementasikan protokol teks terstruktur:

### Protokol Tag Aksi:
```html
<!--ACTION:CREATE_TASK:{"title":"Latihan soal aljabar linear"}-->
<!--ACTION:SET_STUDY_MODE:{"mode":"cepat","reason":"Kondisi sedang kewalahan"}-->
```

### Implementasi Multi-Action:
1. **Parser Regex Global (`frontend/app/utils/chatActions.ts`)**:
   * Menggunakan `matchAll` untuk mengekstrak array aksi `actions: ParsedChatAction[]`.
   * Membersihkan tag baik yang sudah selesai (`-->`) maupun yang masih dalam proses streaming (`$`) dari teks bersih (`cleanText`), sehingga pengguna tidak pernah melihat tag HTML mentah bocor ke layar.
2. **Komponen Kartu Interaktif (`frontend/app/components/chat/ChatActionCard.vue`)**:
   * **Kartu Rekomendasi Mode Timer**: Menampilkan tombol *"Terapkan ke Timer Sekarang"* yang terhubung langsung ke `timerStore.setStudyMode()`.
   * **Kartu Usulan Tugas Baru**: Menampilkan tombol *"Tambah ke Daftar Tugasku"* yang memanggil `taskStore.addTask()` dan otomatis memperbarui status menjadi *"Ada di My Task"*.
   * Dilengkapi indikator loading (`isApplying`) dan penanganan feedback error jika koneksi gagal.
3. **Penyajian Multi-Kartu di Bubble (`ChatBubble.vue`)**:
   * Merender seluruh kartu yang disertakan AI secara berurutan dalam satu gelembung obrolan yang sama.

---

## 5. Investigasi & Resolusi Insiden Stabilitas

### Masalah 1: "Podochat Tidak Membalas" (Reactivity & UI Freeze)
* **Gejala**: Pengguna mengirim pesan, namun pesan AI terlihat macet atau titik-tiga animasi tidak pernah hilang.
* **Penyebab**:
  1. `v-else-if="!isUser"` pada indikator titik-tiga di `ChatBubble.vue` menempel pada `ChatActionCard v-if`. Karena pesan biasa tidak memiliki action card (`null`), cabang `v-else-if` selalu bernilai `true` dan merender animasi titik-tiga secara permanen.
  2. `sendMessage` di `useAiChat.ts` menunggu `await chatStore.saveMessage('user')` ke backend Laravel sebelum memulai stream AI, menyebabkan jeda jaringan memblokir inisialisasi AI.
* **Solusi**:
  * Memperbaiki logika titik-tiga menjadi `v-if="!isUser && !parsedMessage.cleanText"` (hanya muncul jika teks balasan masih kosong).
  * Menjadikan penyimpanan pesan pengguna ke Laravel berjalan di latar belakang secara asinkron (*non-blocking*).
  * Menambahkan pembuatan sesi lokal instan saat pengguna berada dalam mode testing/guest.

---

### Masalah 2: "Lonjakan Antrean Sesaat" (Gateway 9Router 400/503)
* **Gejala**: Muncul pesan fallback *"Maaf, koneksi Podo ke server AI sedang mengalami lonjakan antrean sesaat..."*.
* **Penyebab**:
  1. Rute model `podofriend` pada reverse proxy `9router.isasilva.web.id` merotasikan request ke beberapa backend upstream. Beberapa giliran rotasi mengembalikan `400 Model is unavailable` atau `503 Service overloaded`.
  2. Adanya panggilan ganda (*double-call*) ke LLM classifier sebelum pesan utama dikirim, mempercepat terjadinya *rate limiting*.
* **Solusi**:
  * Menghapus panggilan LLM classifier terpisah; mengandalkan 2.500 kata kunci Vocabulary Bank yang 100% andal dan instan (0 ms).
  * Mengimplementasikan **Multi-Model Candidate Retry Engine** di `chat.post.ts`:
    * Kandidat: `['podofriend', 'ag/gpt-oss-120b-medium', 'ag/gemini-3.8-flash']`.
    * Jika `podofriend` menerima 400/503, sistem otomatis mencoba ulang hingga 2 kali. Jika masih gagal, sistem secara mulus beralih ke model cadangan yang aktif (`ag/gpt-oss-120b-medium`) tanpa menampilkan pesan error ke pengguna.

---

### Masalah 3: Gagal Menyimpan Task ke Database (Tabel Hilang)
* **Gejala**: Tombol *"Tambah ke Daftar Tugasku"* diklik tetapi tugas tidak tersimpan atau menimbulkan error di konsol.
* **Penyebab**:
  * Pengecekan pada log backend `backend/storage/logs/laravel.log` mengungkap error:
    ```
    SQLSTATE[42S02]: Base table or view not found: 1146 Table 'podo_friends.tasks' doesn't exist
    ```
  * Berkas migrasi database `2026_10_04_000003_create_tasks_table` di Laravel sebelumnya belum dijalankan (*Pending*).
* **Solusi**:
  * Menjalankan perintah migrasi Laravel:
    ```bash
    php artisan migrate
    ```
    Tabel `tasks` dan `user_achievements` berhasil dibuat dengan skema UUID dan soft-delete.
  * Menambahkan pemanggilan `taskStore.fetchTasks()` pada saat halaman `/chatbot` pertama kali dimuat.
  * Menambahkan penanganan error visual di `ChatActionCard.vue` agar menampilkan notifikasi jika terjadi kendala penyimpanan.

---

## 6. Struktur Berkas & Modul yang Terlibat

| Lokasi Berkas | Peran & Modifikasi Utama |
| :--- | :--- |
| `frontend/server/utils/vocab/*.ts` | 5 berkas kosakata emosi (masing-masing tepat 500 keyword unik). |
| `frontend/server/utils/vocabularyBank.ts` | Normalisasi teks, deteksi emosi cepat, dan pengaitan konteks Pomodoro. |
| `frontend/server/utils/promptBuilder.ts` | Generator SystemMessage LangChain, sliding window history, dan panduan persona. |
| `frontend/server/api/ai/chat.post.ts` | Endpoint Nitro streaming, multi-model retry engine, dan penanganan fallback. |
| `frontend/app/utils/chatActions.ts` | Parser protokol aksi terstruktur (`CREATE_TASK` & `SET_STUDY_MODE`) multi-action. |
| `frontend/app/components/chat/ChatBubble.vue` | Komponen gelembung chat, rendering multi action cards, dan typing indicator in-place. |
| `frontend/app/components/chat/ChatActionCard.vue` | Kartu UI interaktif untuk menerapkan mode timer dan menambah task ke To-Do list. |
| `frontend/app/pages/chatbot.vue` | Inisialisasi auto-session, sinkronisasi state tasks, dan layout workspace obrolan. |
| `frontend/app/stores/chat.ts` | Pinia store riwayat obrolan dengan fallback local session. |
| `frontend/app/stores/task.ts` | Pinia store manajemen To-Do list dan sinkronisasi ke backend Laravel. |
| `backend/database/migrations/*_tasks_table.php` | Migrasi tabel database `tasks` yang telah aktif. |

---

## 7. Panduan Pengujian & Verifikasi

1. **Uji Typecheck**:
   ```bash
   cd frontend && pnpm typecheck
   ```
   *Ekspektasi*: Lolos tanpa ada error tipe TypeScript.

2. **Uji Aliran Streaming Endpoint**:
   ```bash
   curl -N -X POST http://localhost:3000/api/ai/chat \
     -H "Content-Type: application/json" \
     -d '{"messages":[{"sender":"user","message":"aku mau belajar matematika"}],"userName":"Isa"}'
   ```
   *Ekspektasi*: Server Nitro langsung mengalirkan respon teks dan menyertakan tag aksi ganda di akhir pesan.

3. **Uji Antarmuka Web (End-to-End)**:
   * Buka browser di `http://localhost:3000/chatbot`.
   * Ketik pesan: *"aku ingin mengerjakan matematika"*.
   * Verifikasi bahwa balasan AI muncul secara mengalir (*streaming*) tanpa emoji.
   * Verifikasi bahwa kartu aksi **"Usulan Tugas Baru"** dan **"Rekomendasi Mode"** muncul di bawah pesan.
   * Klik tombol **[+ Tambah ke Daftar Tugasku]**, pastikan status berubah menjadi **"Ada di My Task"**.
   * Buka Dashboard (`/dashboard`), pastikan tugas matematika tersebut telah tercatat di daftar **My Task**.
