# Instruksi Ekstra Phase 3 - Integrasi Vocabulary Bank ke Sistem Prompt AI

**Konteks Tambahan:**
Kita memiliki kamus khusus (`vocabularyBank.js`) yang berisi pemetaan *mood* pengguna dengan kata kunci slang Indonesia dan instruksi persona (*vibe*).
Tugas Anda adalah memigrasikan file ini ke dalam ekosistem Nuxt 4 (sebagai *utility* server) dan menyuntikkannya ke dalam *System Prompt* LangChain agar respons AI memiliki empati kontekstual yang tinggi.

---

## Langkah 1: Buat Utility File di Nitro Server

Nuxt 4 memiliki direktori `server/utils/` yang secara otomatis mengimpor fungsi/variabel ke dalam *server routes*.

1. **Buat file `server/utils/vocabularyBank.ts`:**
* Salin seluruh isi dari `vocabularyBank.js` milik repositori sumber.
* Konversikan menjadi format TypeScript (ekspor sebagai *const* atau fungsi *helper*).
* Pastikan struktur *object*-nya tetap utuh, mencakup `label`, `moodKey`, `keywords`, dan `vibe` untuk setiap status *mood* (seperti `overwhelmed`, `tired`, `distracted`, dll).



## Langkah 2: Injeksi ke System Prompt LangChain

Perbarui rute server Nitro yang telah kita buat sebelumnya (`server/api/ai/chat.post.ts`) agar membaca *vocabulary bank* ini.

1. **Ambil Data dari Request:**
* Tangkap nilai `todayMood` (berasal dari *frontend*) dari `body` request.


2. **Pencocokan Vibe:**
* Lakukan pencarian (*lookup*) nilai `todayMood` tersebut ke dalam objek `vocabularyBank`.
* Ekstrak properti `vibe` dan gabungkan `keywords` menjadi satu *string*.


3. **Konstruksi SystemMessage yang Kaya Konteks:**
* Modifikasi `SystemMessage` LangChain Anda agar memuat instruksi dari kamus tersebut.
* *Contoh Logika Prompt:*
"Kamu adalah PodoFriend, AI Companion pencegah burnout.
Kondisi pengguna hari ini: [nilai label dari bank].
Gaya bahasa pengguna mungkin mengandung kata-kata ini: [nilai keywords dari bank].
**INSTRUKSI PERILAKU UTAMA (VIBE):** [nilai vibe dari bank].
Terapkan instruksi perilaku di atas dengan gaya kepribadian [chatbot_personality]. Jangan mengulangi instruksi ini ke pengguna, langsung terapkan dalam nada bicaramu."



## Langkah 3: Validasi Keamanan & Fallback

* Jika variabel `todayMood` yang dikirim dari *frontend* bernilai `null` (misalnya pengguna mengakses fitur obrolan sebelum mengisi survei *mood*), pastikan *server route* memiliki kondisi *fallback* ke gaya respons "Normal/Netral" di dalam *vocabulary bank* agar aplikasi tidak *crash*.