# Rencana Implementasi & Spesifikasi Revisi State Animasi Maskot Podo (Mascot Animation Plan - V2)

> **Dokumen Terkait:**  
> - [FRONTEND_HANDOVER_DOCUMENTATION.md](./FRONTEND_HANDOVER_DOCUMENTATION.md)  
> - [README.md](./README.md)  
> - [MASCOT_ANIMATION_PLAN_V1.md](./MASCOT_ANIMATION_PLAN_V1.md) (Dokumen Rencana Awal V1)  
> - `.agent/docs/components.md` & `.agent/docs/architecture.md`  
> **Status:** Direvisi & Selesai Diimplementasikan (*Smooth Transitions & 2-Mascot Chatbot Layout*)  
> **Tanggal Pembaruan:** Oktober 2026  

---

## 1. Latar Belakang & Kebutuhan Revisi (V2)

Berdasarkan evaluasi terhadap pengujian awal, terdapat dua kebutuhan penyempurnaan utama:

1. **Transisi Halus Antar-Animasi (*Smooth State Transitions*):**
   - Sebelumnya, pergantian SVG di `AppMascot.vue` terjadi secara instan (*hard swap* melalui `v-html`), menyebabkan kedipan tajam (*visual pop/flicker*).
   - Pengguna menginginkan pergantian animasi berlangsung mulus dan luwes (*smooth transition* / *cross-fade scale effect*) saat beralih antara `idle`, `thinking`, `listening`, `excited`, `sleepy`, atau `searching`.

2. **Aturan "Hanya 2 Maskot" di Layar Chatbot (`/chatbot`):**
   - **Masalah:** Setiap kali AI merespons, sebuah avatar maskot baru di-generate di sebelah bubble pesan (`ChatBubble.vue`), sehingga riwayat obrolan dipenuhi tumpukan maskot yang redundan. Selain itu, terdapat maskot tambahan di header (`chatbot.vue:187:10`).
   - **Solusi yang Diterapkan:**
     - **Maskot #1 (Area Bubble Chat):** Hanya tampil di sebelah pesan AI **terbaru / yang sedang aktif merespons**. Pesan-pesan AI lama dalam riwayat tidak lagi men-generate maskot baru (tetap mempertahankan indentasi agar layout rata kiri tidak bergeser).
     - **Maskot #2 (Samping Kiri Input Chat):** Menghapus indikator maskot dari header (`chatbot.vue:187:10`) dan memindahkannya ke **samping kiri kolom input pesan** (`ChatInput.vue:93:4`) sebagai avatar pendamping interaktif yang mengamati input pengguna.
     - Di layar obrolan pengguna konsisten **hanya terdapat tepat 2 maskot**.

---

## 2. Inventarisasi Aset Animasi (Mote Studio Exports)

| Varian | Berkas Sumber | Karakteristik Visual | Skenario Penggunaan |
|---|---|---|---|
| **`idle`** | `mote.js` | Mengambang santai, ritme napas tenang, kedip mata | Standby, belum ada interaksi pengguna |
| **`thinking`** | `Animation/moteThinking.js` | Mata melirik samping-atas, ekspresi berpikir/analisis | AI sedang memproses / streaming, timer dijeda |
| **`listening`** | `Animation/moteListening.js` | Mata fokus menyimak penuh perhatian | Pengguna sedang mengetik pesan di input, timer Pomodoro sedang fokus |
| **`excited`** | `Animation/moteExcited.js` | Mata membesar bulat, melenting ceria | Selesai generate pesan AI, sesi Pomodoro tuntas |
| **`sleepy`** | `Animation/moteSleepy.js` | Kelopak mata sayu mengantuk, gerakan rileks | Sesi istirahat (*Break*), mood *Tired/Overwhelmed* |
| **`searching`** | `Animation/moteSearching.js` | Mata melirik cepat ke kiri dan kanan | Pencarian riwayat chat aktif di sidebar |

---

## 3. Rencana Arsitektur & Perubahan Teknis V2

### A. Transisi Halus di `AppMascot.vue`
Menggunakan `<Transition name="mascot-morph" mode="out-in">` yang dibungkus dengan `:key="animation"`. Saat prop `animation` berubah, elemen SVG lama akan mengecil halus (`scale(0.88)`) dan memudar (`opacity: 0`), kemudian digantikan oleh SVG baru yang mengembang lembut ke ukuran penuh.

```css
.mascot-morph-enter-active,
.mascot-morph-leave-active {
  transition: opacity 0.22s cubic-bezier(0.4, 0, 0.2, 1),
              transform 0.22s cubic-bezier(0.4, 0, 0.2, 1);
}
.mascot-morph-enter-from {
  opacity: 0;
  transform: scale(0.88);
}
.mascot-morph-leave-to {
  opacity: 0;
  transform: scale(0.92);
}
```

### B. Aturan "2 Maskot" di Layar Chatbot

```text
+-------------------------------------------------------------------+
|  Header Chat: [<- Kembali] [Sesi Aktif Badge]      [Mood] [Gaya AI]| <- Bersih (pill maskot dipindahkan)
+-------------------------------------------------------------------+
|  Area Chat (Messages Stream):                                     |
|    User: "Halo Podo..."                                           |
|    (Pesan AI Lama): Teks jawaban tanpa maskot baru (indentasi rata)|
|    User: "Bisa bantu jelaskan materi ini?"                        |
|                                                                   |
|    [MASKOT #1] AI (Terbaru/Aktif):                                 |
|    (Thinking saat proses / Idle saat selesai)                     |
+-------------------------------------------------------------------+
|  Area Input Bawah:                                                |
|    [MASKOT #2]  [   Tanya PodoFriend......              [Kirim] ] |
|    (Companion)  (Input Bar Utama)                                 |
+-------------------------------------------------------------------+
```

1. **Maskot #1 di Area Chat (`ChatBubble.vue` & `chatbot.vue`):**
   - Ditambahkan prop `isLatestAi?: boolean` ke `ChatBubble.vue`.
   - Di `chatbot.vue`, dihitung `isLatestAi = (msg.id === latestAiMessageId)`.
   - Jika `isLatestAi === true`: merender `<AppMascot size="custom" :animation="aiAvatarAnimation" />`.
   - Jika `isLatestAi === false`: merender spacer kosong (`w-10 h-10 flex-shrink-0 invisible`) tanpa SVG maskot baru, sehingga teks tetap rapi dan tidak ada duplikasi maskot.
   - Saat `ChatTypingIndicator.vue` tampil (sebelum pesan AI pertama terbit): indikator tersebut yang menjadi Maskot #1 (`animation="thinking"`).

2. **Maskot #2 di Area Input (`ChatInput.vue`):**
   - Hapus pill status maskot dari header `chatbot.vue:187:10`.
   - Tempatkan maskot pendamping interaktif di sebelah kiri bar input (`ChatInput.vue:93:4`):
     ```html
     <div class="flex items-center gap-2.5 sm:gap-3.5 w-full">
       <!-- Maskot Pendamping Input (Maskot #2) -->
       <div
         class="w-24 h-24 sm:w-24 sm:h-24 flex-shrink-0 flex items-center justify-center shadow-sm transition-all hover:scale-105 select-none"
         :title="`Status Podo: ${chatStore.mascotState}`"
       >
         <AppMascot
           size="custom"
           custom-class="w-24 h-24 sm:w-24 sm:h-24"
           :animation="chatStore.mascotState"
         />
       </div>
       
       <!-- Kotak Input Utama -->
       <div class="flex-1 relative flex items-center bg-white rounded-3xl sm:rounded-full border-2 border-orange-300 focus-within:border-orange-500 shadow-md transition-all p-2 pl-5">
         <textarea ... />
         <button send ... />
       </div>
     </div>
     ```
   - Maskot ini langsung bereaksi:
     - `listening`: saat pengguna memfokuskan atau mengetik pesan.
     - `thinking`: saat pengguna menekan tombol kirim dan AI mulai memproses.
     - `excited`: saat AI selesai menghasilkan balasan.
     - `idle`: standby.

3. **Dashboard AI Companion (`PomodoroTimer.vue:378:8`):**
   - Tetap konsisten dengan 1 AI companion yang reaktif:
     - `listening` (saat fokus berjalan).
     - `sleepy` (saat break/istirahat).
     - `thinking` (saat jeda).
     - `excited` (saat selesai/modal trophy).

---

## 4. Rencana Tahapan Eksekusi Revisi V2

1. [x] **Pembaruan Dokumen Rencana (Plan V2):** Berkas ini (`collaboration_docs/MASCOT_ANIMATION_PLAN_V2.md`).
2. [x] **Menerapkan Transisi Halus di `AppMascot.vue`:** Membungkus SVG dengan `<Transition name="mascot-morph" mode="out-in">` dan style transform scale + opacity berdurasi 220ms.
3. [x] **Refaktor Chatbot Layout (Aturan 2 Maskot):**
   - **Header:** Hapus badge maskot dari header `chatbot.vue` agar header kembali bersih.
   - **ChatInput:** Menambahkan maskot pendamping di sisi kiri kotak input (`ChatInput.vue:93:4`) yang bereaksi terhadap status mengetik, berpikir, dan selebrasi.
   - **ChatBubble:** Memodifikasi dengan prop `isLatestAi` agar hanya pesan AI paling akhir/terbaru yang memiliki avatar maskot aktif, sementara pesan lama menggunakan placeholder spacer tak kasat mata agar alignment tetap rapi.
4. [x] **Pengujian & Validasi:**
   - Telah menjalankan `pnpm typecheck` dan berhasil lulus dengan Exit Code 0 tanpa error.
   - Menguji transisi animasi dan tata letak di http://localhost:3000/chatbot.
