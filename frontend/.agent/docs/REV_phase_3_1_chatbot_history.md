# Instruksi Pengembangan Frontend - PodoFriend (Phase 3: Multi-Sesi Chat & LangChain)

**Konteks Sistem:**
Anda adalah AI Developer Agent (Nuxt 4, Vue 3, Tailwind CSS). Phase 1 dan Phase 2 telah selesai. API Backend baru saja direfaktorisasi untuk mendukung arsitektur multi-sesi (1 Sesi memiliki banyak Pesan).
Tugas Anda pada Phase 3 adalah membangun antarmuka obrolan penuh (`/chatbot`) dengan fitur riwayat sesi di sidebar, serta mengintegrasikan LangChain + 9router dengan kalibrasi *temperature* agar respons AI natural dan bervariasi.

---

## Langkah 1: State Management Multi-Sesi (`stores/chat.ts`)

Sesuaikan Pinia store dengan endpoint `/api/chat-sessions` yang baru.

1. **State:**
* `sessions` (array objek sesi untuk sidebar).
* `activeSessionId` (UUID string atau null).
* `messages` (array objek pesan untuk sesi yang sedang aktif).
* `isLoading` (boolean untuk status *typing* AI).


2. **Actions untuk Sesi:**
* `fetchSessions()`: Panggil GET `/api/chat-sessions` dan simpan ke `sessions`.
* `createSession()`: Panggil POST `/api/chat-sessions`. Simpan ID yang dikembalikan ke `activeSessionId`, dan kosongkan array `messages`.


3. **Actions untuk Pesan:**
* `fetchMessages(sessionId)`: Panggil GET `/api/chat-sessions/{sessionId}/messages`. Simpan ke array `messages` (backend sudah mengurutkan secara *ascending*).
* `saveMessage(sender, message)`: Panggil POST `/api/chat-sessions/{activeSessionId}/messages` dengan payload sender (user/ai) dan teks pesan.



---

## Langkah 2: Antarmuka Chatbot & Sidebar (`pages/chatbot.vue`)

Buat layout obrolan yang terbagi menjadi Sidebar Riwayat dan Area Chat Utama.

1. **Sidebar Riwayat (Kiri):**
* Buat panel di sisi kiri (atau *drawer* di mobile).
* Tambahkan tombol utama "Chat Baru" yang akan memicu `createSession()`.
* Tampilkan daftar (list) `sessions` dari Pinia. Jika sebuah sesi diklik, ubah `activeSessionId` dan jalankan `fetchMessages(id_sesi)`.


2. **Area Chat Utama (Kanan):**
* Jika `activeSessionId` null, tampilkan *placeholder* "Pilih atau mulai obrolan baru".
* Jika aktif, tampilkan daftar `messages`.
* **Desain Bubble User:** Rata kanan, latar oranye (`bg-orange-500`), teks putih, sudut melengkung.
* **Desain Bubble AI:** Rata kiri, latar abu-abu terang (`bg-gray-100`), teks gelap. Wajib sisipkan `AppMascot.vue` berukuran kecil di samping gelembung AI.
* **Area Input:** Input teks dan tombol kirim di bagian bawah. Tombol *disable* jika `isLoading` true.



---

## Langkah 3: Integrasi LangChain & 9router (Logika Krusial)

Konfigurasikan model LLM di Nuxt agar memahami konteks pengguna dan memberikan respons yang dinamis.

1. **Kalibrasi Model AI:**
* Saat menginisialisasi model LangChain (ChatOpenAI/Ollama via 9router), pastikan Anda menyetel parameter **temperature: 0.7** (atau 0.8). Ini wajib agar PodoFriend merespons dengan kalimat yang tidak kaku/repetitif.


2. **Sistem Prompt Dinamis:**
* Ambil state `todayMood` dari Pinia `stores/survey.ts` dan `chatbot_personality` dari data User.
* Format *SystemMessage* awal: "Kamu adalah PodoFriend, AI Companion pencegah burnout. Mood pengguna hari ini adalah [todayMood]. Respons pengguna dengan gaya kepribadian yang [chatbot_personality]. Jawab singkat, empatik, dan suportif."


3. **Alur Pengiriman Pesan (Wajib Berurutan):**
Saat pengguna mengetik dan menekan "Kirim", jalankan alur ini:
* **Cek Sesi:** Jika `activeSessionId` null, jalankan `createSession()` terlebih dahulu.
* **Simpan User:** Panggil `saveMessage('user', isiPesan)` ke backend. Tambahkan pesan ke UI lokal agar langsung muncul.
* **Loading:** Set `isLoading = true`.
* **Generate AI:** Lewatkan riwayat pesan (`messages`) beserta *SystemMessage* ke fungsi LangChain/9router.
* **Simpan AI:** Setelah *promise* dari LangChain selesai dan mengembalikan teks balasan, **WAJIB** panggil `saveMessage('ai', responsAI)` ke backend agar memori AI tidak hilang saat di-refresh. Tambahkan respons ke UI lokal.
* **Selesai:** Set `isLoading = false`.



---

## Langkah 4: Poles Interaksi & UX

1. **Auto-Scroll:** Gunakan referensi DOM (template ref) dan fungsi `nextTick()` dari Vue, atau `useScroll` dari `@vueuse/core`, agar layar otomatis bergulir ke bawah setiap kali ada pesan baru.
2. **Typing Indicator:** Saat `isLoading` true, tampilkan komponen *loading* berupa animasi tiga titik (...) berkedip di dalam *bubble* chat AI, untuk mensimulasikan bahwa PodoFriend sedang berpikir.