# Rencana Implementasi & Spesifikasi State Animasi Maskot Podo (Mascot Animation Plan - V1)

> **Dokumen Terkait:**  
> - [FRONTEND_HANDOVER_DOCUMENTATION.md](./FRONTEND_HANDOVER_DOCUMENTATION.md)  
> - [README.md](./README.md)  
> - [MASCOT_ANIMATION_PLAN_V2.md](./MASCOT_ANIMATION_PLAN_V2.md) (Dokumen Revisi V2)  
> - `.agent/docs/components.md` & `.agent/docs/architecture.md`  
> **Status:** Selesai Diimplementasikan (Fase Awal / Rilis V1)  
> **Tanggal:** Oktober 2026  

---

## 1. Latar Belakang & Tujuan (V1)

Aplikasi PodoFriend mengusung identitas visual utama berupa karakter maskot bernama **Podo** (*orange blob companion*). Pada implementasi awal, komponen `AppMascot.vue` bersifat monolitik statis dengan hanya memuat berkas animasi idle `mote.js`.

Untuk meningkatkan keterlibatan emosional pengguna (*emotional engagement*), mencegah kebosanan (*anti-burnout*), serta memberikan umpan balik visual (*visual feedback*) yang intuitif, maskot Podo ditingkatkan agar dapat **berubah ekspresi dan animasi secara reaktif sesuai dengan aktivitas dan kondisi pengguna**:

1. **Halaman Chatbot (`/chatbot`):**
   - Saat pengguna baru saja mengirim pesan dan AI sedang berpikir / memproses balasan (`isLoading = true`), maskot berganti ke animasi **`thinking`**.
   - Saat pengguna sedang mengetik atau fokus di kolom input pesan, maskot dapat beralih ke animasi **`listening`** (menyimak).
   - Saat AI selesai memberikan jawaban atau pada sambutan awal percakapan, maskot beralih ke animasi **`excited`**.
   - Pada `ChatTypingIndicator.vue` dan placeholder gelembung pesan AI yang sedang menunggu token stream pertama, avatar maskot menggunakan status **`thinking`**.
   - Di header bar obrolan, terdapat badge pill status aktivitas maskot (*"Podo sedang berpikir..."*, *"Podo menyimak..."*, *"Podo senang!"*, atau *"Podo aktif"*).

2. **Halaman Dashboard (`/dashboard`) - Pomodoro Timer AI Companion (`PomodoroTimer.vue:378:8`):**
   - **Mode Fokus Aktif (`isRunning = true`):** Maskot menampilkan animasi **`listening`** (fokus mendampingi belajar pengguna dengan konsentrasi tinggi).
   - **Mode Istirahat (`mode === 'break'`):** Maskot menampilkan animasi **`sleepy`** (santai, mata terpejam rehat, mengingatkan pengguna untuk rileks).
   - **Timer Dijeda (*Paused*):** Maskot menampilkan animasi **`thinking`** (menunggu keputusan pengguna untuk lanjut fokus).
   - **Sesi Selesai / Selebrasi (`completeSession` / modal trophy terbuka):** Maskot menampilkan animasi **`excited`** (melompat gembira merayakan keberhasilan fokus pengguna).
   - **Status Standby / Default:** Maskot berada dalam animasi santai **`idle`**.

---

## 2. Inventarisasi Aset Animasi (Mote Studio Exports)

Seluruh berkas animasi merupakan SVG mandiri tanpa dependensi runtime pihak ketiga (*pure CSS keyframes*), tersimpan di direktori `.agent/docs/Animation/` dan `.agent/docs/`:

| Nama Varian | Berkas Sumber | Karakteristik Visual | Skenario Penggunaan Utama |
|---|---|---|---|
| **`idle`** (Default) | `mote.js` | Mengambang santai, ritme napas tenang, kedip mata periodik | Posisi diam, standby, belum ada aksi pengguna |
| **`thinking`** | `Animation/moteThinking.js` | Bola mata melirik ke samping-atas, ekspresi merenung & menganalisis | AI sedang berpikir (`isLoading`), timer dijeda, atau sistem sedang memuat memori |
| **`listening`** | `Animation/moteListening.js` | Mata berkedip fokus & menyimak ke arah pembicara/pengguna | User sedang mengetik pertanyaan chat, atau timer sesi fokus Pomodoro sedang berjalan |
| **`excited`** | `Animation/moteExcited.js` | Mata membesar bulat antusias, gerakan melenting ceria | Sesi fokus selesai (selebrasi), streaming balasan AI tuntas, sambutan awal chat |
| **`sleepy`** | `Animation/moteSleepy.js` | Kelopak mata sayu mengantuk, gerakan rileks perlahan | Sesi istirahat Pomodoro (*Break*), deteksi mood *Tired/Overwhelmed* |
| **`searching`** | `Animation/moteSearching.js` | Mata melirik cepat ke kiri dan kanan memindai informasi | User mengetik di pencarian sesi chat, atau saat mengganti task belajar |

---

## 3. Berkas & Komponen yang Dimodifikasi pada V1

```text
frontend/
├── app/
│   ├── types/
│   │   └── mascot.ts              # [BARU] Definisi TypeScript tipe MascotAnimationState
│   ├── components/
│   │   ├── AppMascot.vue          # [REFAKTOR] Menerima prop animation, pemetaan SVG dinamis
│   │   ├── PomodoroTimer.vue      # [UPDATE] Baris 378: Integrasi state animasi AI Companion
│   │   └── chat/
│   │       ├── ChatTypingIndicator.vue # [UPDATE] Avatar menggunakan animation="thinking"
│   │       ├── ChatBubble.vue     # [UPDATE] Avatar AI menyesuaikan status pesan/loading
│   │       └── ChatInput.vue      # [UPDATE] Emisi event fokus/mengetik untuk trigger state listening
│   ├── pages/
│   │   └── chatbot.vue            # [UPDATE] Reaktivitas maskot banner dan indikator saat generate
│   ├── stores/
│   │   ├── chat.ts                # [UPDATE] Helper state mascotState ('idle' | 'listening' | 'thinking' | 'excited')
│   │   └── timer.ts               # [KONSISTEN] Memberikan status isRunning, mode, dan completion
│   └── composables/
│       └── useAiChat.ts           # [UPDATE] Mengatur transisi state maskot: listening -> thinking -> streaming -> excited -> idle
```

---

## 4. Rincian Teknis Implementasi V1

### A. Tipe Data (`app/types/mascot.ts`)
```typescript
export type MascotAnimationState = 
  | 'idle' 
  | 'thinking' 
  | 'listening' 
  | 'excited' 
  | 'sleepy' 
  | 'searching'
```

### B. Refaktor `AppMascot.vue` (V1)
- Menambahkan prop `animation: MascotAnimationState` dengan default `'idle'`.
- Membuat dictionary lookup yang mengimpor semua berkas SVG dari `.agent/docs/Animation/` dan `.agent/docs/mote.js`.
- Menggunakan `computed` reaktif untuk memilih string SVG sesuai prop `animation`.

```vue
<script setup lang="ts">
import type { MascotAnimationState } from '~/types/mascot'
import { moteSvg as idleSvg } from '~~/.agent/docs/mote.js'
import { moteSvg as excitedSvg } from '~~/.agent/docs/Animation/moteExcited.js'
import { moteSvg as listeningSvg } from '~~/.agent/docs/Animation/moteListening.js'
import { moteSvg as searchingSvg } from '~~/.agent/docs/Animation/moteSearching.js'
import { moteSvg as sleepySvg } from '~~/.agent/docs/Animation/moteSleepy.js'
import { moteSvg as thinkingSvg } from '~~/.agent/docs/Animation/moteThinking.js'

interface Props {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'custom'
  customClass?: string
  animation?: MascotAnimationState
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  customClass: '',
  animation: 'idle',
})

const svgMap: Record<MascotAnimationState, string> = {
  idle: idleSvg,
  thinking: thinkingSvg,
  listening: listeningSvg,
  excited: excitedSvg,
  sleepy: sleepySvg,
  searching: searchingSvg,
}

const currentSvg = computed(() => svgMap[props.animation] || idleSvg)
</script>

<template>
  <div
    :class="['inline-flex items-center justify-center transition-transform select-none', sizeClass]"
    v-html="currentSvg"
  />
</template>
```

### C. Logika AI Companion di `PomodoroTimer.vue:378:8`
Tentukan state animasi pendamping secara terkomputasi (`companionMascotAnimation`):

```typescript
const companionMascotAnimation = computed<MascotAnimationState>(() => {
  // 1. Sesi selesai / selebrasi
  if (timerStore.isCompletedModalOpen) {
    return 'excited'
  }
  // 2. Mode istirahat
  if (timerStore.mode === 'break') {
    return 'sleepy'
  }
  // 3. Sesi fokus sedang berjalan
  if (timerStore.isRunning) {
    return 'listening'
  }
  // 4. Timer dijeda di tengah sesi
  if (timerStore.timeLeft < timerStore.totalDuration) {
    return 'thinking'
  }
  // 5. Default standby
  return 'idle'
})
```

### D. Logika Interaksi di Chatbot V1 (`chatbot.vue` & `useAiChat.ts`)
1. **Header Chatbot:** Menempatkan Mascot Status Indicator Pill di header yang bereaksi terhadap `chatStore.mascotState`.
2. **Avatar di Gelembung Chat:** Setiap gelembung pesan AI menampilkan avatar maskot kecil.

---

## 5. Rencana Tahapan Eksekusi V1

1. [x] **Membaca Dokumen Standar & Arsitektur:** Telah membaca seluruh berkas `.md` di `collaboration_docs/` dan `.agent/docs/`.
2. [x] **Membuat Dokumen Rencana (Plan V1):** Berkas ini (`collaboration_docs/MASCOT_ANIMATION_PLAN_V1.md`).
3. [x] **Membuat Type Definition:** `app/types/mascot.ts`.
4. [x] **Mengupgrade `AppMascot.vue`:** Menambahkan dukungan prop `animation` dengan 6 variasi SVG (`idle`, `thinking`, `listening`, `excited`, `sleepy`, `searching`).
5. [x] **Menerapkan di `PomodoroTimer.vue`:** Memperbarui AI Companion maskot di baris 378:8 dan modal selebrasi agar bereaksi terhadap siklus timer (focus/break/pause/completed).
6. [x] **Menerapkan di Chatbot (`chatbot.vue`, `useAiChat.ts`, `ChatTypingIndicator.vue`, `ChatBubble.vue`, `ChatInput.vue`, `ChatSidebar.vue`):** Mengintegrasikan state `thinking`, `listening`, `excited`, `searching`, dan `idle` saat interaksi chat berlangsung.
7. [x] **Pengujian & Validasi:** Telah menjalankan `pnpm typecheck` dan berhasil lulus dengan Exit Code 0 tanpa error.
