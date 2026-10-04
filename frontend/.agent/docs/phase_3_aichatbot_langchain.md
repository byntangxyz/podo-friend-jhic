# Instruksi Pengembangan Frontend - PodoFriend (Phase 3: Integrasi LangChain & AI Chat)

**Konteks Sistem:** 
Anda adalah AI Developer Agent (Nuxt 4, Vue 3, Tailwind CSS). Phase 1 (Auth) dan Phase 2 (Dashboard, Timer, Mood) telah selesai. Tugas Anda pada Phase 3 adalah menghidupkan "AI Companion" melalui halaman obrolan penuh (`/chatbot`), mengintegrasikan memori percakapan ke backend, dan memproses *prompt* menggunakan LangChain + 9router.

---

## Langkah 1: State Management Memori Obrolan (`stores/chat.ts`)
AI Companion membutuhkan memori jangka pendek agar percakapan terasa natural saat halaman dimuat ulang.

1. **Buat State & Actions di Pinia:**
   * **State:** `messages` (array dari objek pesan yang berisi `id`, `sender` [user/ai], `message`, dan `created_at`), `isLoading` (boolean untuk status *typing* AI).
   * **Action `fetchChatHistory()`:** Panggil `GET /api/chat`. Petakan data dari backend ke dalam state `messages`. Urutkan dari pesan terlama ke terbaru.
   * **Action `saveMessageToApi(sender, message)`:** Panggil `POST /api/chat` dengan payload `sender` dan `message`. Ini berjalan di latar belakang (*background*) untuk sinkronisasi.

## Langkah 2: Antarmuka Chatbot (`pages/chatbot.vue`)
Buat halaman obrolan yang interaktif dan sesuai standar UI/UX PodoFriend.

1. **Layout & Komponen Dasar:**
   * Gunakan `layouts/dashboard.vue` agar navigasi utama tetap ada.
   * Buat kontainer obrolan dengan latar belakang krem (`bg-orange-50`).
2. **Desain Chat Bubbles:**
   * **Pesan Pengguna (`sender: 'user'`):** Rata kanan (*justify-end*). Gelembung berwarna oranye (`bg-orange-500`), teks putih, sudut `rounded-2xl` dengan sudut kanan bawah lancip.
   * **Pesan AI (`sender: 'ai'`):** Rata kiri (*justify-start*). Gelembung berwarna abu-abu terang (`bg-gray-100`), teks gelap (`text-stone-900`), sudut `rounded-2xl` dengan sudut kiri bawah lancip.
   * Sisipkan komponen `AppMascot.vue` berukuran kecil (avatar) di samping setiap pesan AI.
3. **Area Input (`components/ChatInput.vue`):**
   * Buat *input field* (`BaseInput`) di bagian bawah layar.
   * Tambahkan tombol kirim (ikon pesawat kertas/panah) yang akan ter- *disable* saat `isLoading` bernilai *true*.

## Langkah 3: Integrasi LangChain + 9router
Ini adalah inti dari kecerdasan AI Companion. Karena Anda beroperasi di client-side/Nuxt, bangun logika *service* pembungkus.

1. **Persiapan Sistem Prompt Dinamis:**
   * Sebelum memanggil LLM (via LangChain), ambil state terkini dari Pinia:
     * Ambil `todayMood` dari `stores/survey.ts` (Energetic, Balanced, Tired, Overwhelmed, atau Distracted).
     * Ambil preferensi pengguna (seperti `chatbot_personality`) dari state Auth/User.
   * Konstruksikan *System Prompt* dasar. Contoh logika *string*: 
     "Kamu adalah PodoFriend, AI Companion pencegah burnout. Saat ini mood pengguna adalah [todayMood] dan kamu harus merespons dengan gaya [chatbot_personality]. Jawab dengan singkat, empatik, dan berikan dorongan positif."
2. **Logika Eksekusi (Alur Obrolan):**
   * Saat pengguna menekan "Kirim":
     1. Tambahkan pesan pengguna ke state lokal `messages` (agar UI langsung ter- *update*).
     2. Panggil `saveMessageToApi('user', isiPesan)` ke backend.
     3. Ubah `isLoading = true` (tampilkan indikator AI sedang mengetik).
     4. Lewatkan riwayat obrolan (pesan sistem + pesan sebelumnya) ke dalam *chain* LangChain/9router.
     5. Setelah menerima respons dari AI:
        * Tambahkan pesan AI ke state lokal `messages`.
        * Panggil `saveMessageToApi('ai', responsAI)` ke backend.
        * Ubah `isLoading = false`.

## Langkah 4: Poles Interaksi UI (Auto-Scroll)
Pastikan pengalaman mengobrol terasa mulus layaknya aplikasi *chatting* modern.

1. Terapkan fungsi *auto-scroll* ke bagian paling bawah kontainer pesan setiap kali ada pesan baru yang ditambahkan ke state `messages`. Anda dapat menggunakan `@vueuse/core` (seperti `useScroll`) atau referensi DOM Vue dasar (`template ref` + `nextTick`).
2. Tampilkan indikator *loading* berupa animasi tiga titik (...) berkedip di dalam *chat bubble* AI selama menunggu proses *generate* dari LangChain.