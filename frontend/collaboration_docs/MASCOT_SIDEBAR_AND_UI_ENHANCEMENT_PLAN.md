# Rencana Implementasi: Maskot Animasi Reaktif Sidebar, FireStreak Icon, & Font Plus Jakarta Sans

> **Dokumen Terkait:**  
> - [FRONTEND_HANDOVER_DOCUMENTATION.md](./FRONTEND_HANDOVER_DOCUMENTATION.md)  
> - [MASCOT_ANIMATION_PLAN_V2.md](./MASCOT_ANIMATION_PLAN_V2.md)  
> - [README.md](./README.md)  
> - `.agent/docs/Animation/` & `.agent/docs/FireStreak.svg`  
> **Status:** Diimplementasikan & Berfungsi Penuh  
> **Tanggal:** Oktober 2026  

---

## 1. Ringkasan Kebutuhan & Tujuan

Dokumen ini memuat rencana kerja mendalam untuk tiga pembaruan visual dan interaktif utama pada frontend PodoFriend:

1. **Maskot Animasi Reaktif Sidebar (Pengganti `pomodoro_right_bar.svg`):**
   - Mengganti aset statis gambar SVG di sisi kanan desktop (`index.vue` dan `dashboard.vue`) menjadi komponen maskot hidup yang reaktif terhadap interaksi kursor (*hover* dan *cursor tracking*) serta klik (*click exit & redirect* ke `/chatbot`).
   - Pita latar belakang oranye tetap diam menempel di tepi layar, hanya tubuh Podo yang menyembul ke kiri saat hover.
   - Mengusung perilaku:
     - **Default:** Mata bergerak mengikuti posisi kursor mouse pengguna (*eye cursor tracking*) secara halus dengan kedipan natural.
     - **Hover:** Maskot menyembul lebih jauh ke arah kiri layar (ke arah konten belajar) dengan pergeseran `translateX(-46px)` dan speech bubble interaktif.
     - **Clicked:** Maskot meluncur sembunyi ke kanan sepenuhnya ke luar layar (`translateX(480px)`), dan baru setelah benar-benar keluar layar (~500ms) pengguna dialihkan (*redirect*) ke `/chatbot`.

2. **Pembaruan Ikon Api Streak Gamifikasi (`FireStreak.svg`):**
   - Mengganti ikon bawaan `<Icon name="lucide:flame" />` pada halaman statistik gamifikasi (`app/pages/gamification/stats.vue:102:8`) dengan aset resmi `FireStreak.svg`.
   - Mempertahankan overlay angka streak dan status aktif/inaktif (*flame active vs cooldown*).

3. **Standardisasi Tipografi Profesional (Google Font Plus Jakarta Sans):**
   - Mengintegrasikan Google Fonts resmi untuk `Plus Jakarta Sans` melalui preconnect & stylesheet di konfigurasi Nuxt.
   - Menghubungkan font ke Tailwind CSS agar seluruh antarmuka web langsung mengadopsi tipografi modern dan elegan.

---

## 2. Rincian Teknis & Arsitektur Perubahan

### A. Maskot Animasi Reaktif Sidebar (`SidebarMascot.vue`)

#### 1. Masalah Saat Ini
Saat ini di `app/pages/index.vue:78` dan `app/pages/dashboard.vue:92`, banner samping kanan menggunakan tag gambar statis:
```html
<NuxtLink to="/chatbot" class="fixed right-0 top-20 bottom-0 ...">
  <img src="/pomodoro_right_bar.svg" alt="Podo Mascot Background" class="..." />
</NuxtLink>
```
Gambar ini tidak bernyawa dan tidak memberikan feedback interaksi ketika pengguna melayangkan kursor atau mengkliknya.

#### 2. Konsep Animasi Terpilih (Clean Cursor Tracker & Hide-on-Click)
Berbeda dari animasi Chatbot yang berada di tengah kontainer, Sidebar Mascot terikat pada tepi kanan layar (*docked right*).
Animasi memiliki 3 fase interaksi:

| State | Perilaku Gerakan | Respon Visual |
|---|---|---|
| **1. Default (Idle + Cursor Follow)** | Gerakan napas lembut (*breathing float*) di mana kedua mata Podo secara dinamis melirik mengikuti posisi kursor mouse (`mousemove` tracking) dengan batas rongga mata alami. Mata berkedip natural tanpa efek glint/blush berlebih. | Teman belajar yang atentif dan memperhatikan aktivitas pengguna secara natural. |
| **2. Hover (Menyembul ke Layar)** | Maskot Podo dan speech bubble menyembul lebih jauh ke arah kiri layar (`translateX(-46px)`). Muncul sapaan ramah bergantian (*"Tanya Podo AI!"*, *"Mau ngobrol bareng Podo?"*). | Mengundang pengguna berinteraksi dan memberi sinyal kesiapan membantu. |
| **3. Clicked (Meluncur Keluar & Redirect)** | Saat diklik, maskot meluncur cepat ke kanan sepenuhnya ke luar layar (`translateX(480px)`). Setelah animasi selesai (500ms), `navigateTo('/chatbot')` baru dieksekusi. | Transisi keluar layar yang mulus dan memuaskan sebelum berpindah halaman. |

#### 3. Struktur Komponen Baru: `app/components/SidebarMascot.vue`
Komponen memisahkan:
1. **Background Wave Ribbon:** Siluet gelombang latar oranye transparan (`fill="#F56A16"` dengan opacity 0.4) yang tetap menyatu dengan tepi kanan layar.
2. **Karakter Podo Vektor Bersih:** Tubuh oranye Podo dengan mata hitam solid (`#151612`) yang terhubung dengan listener `mousemove` untuk eye-tracking dan keyframe CSS blink.
3. **Motion & Transition Handler:** Mengelola state `isExiting` untuk transisi meluncur ke kanan (480px) sebelum mengeksekusi navigasi Nuxt programatis.

---

### B. Penggantian Ikon Api di Halaman Statistik (`stats.vue`)

#### 1. Lokasi Target
Berkas: `app/pages/gamification/stats.vue:90-110` (disekitar baris 102:8).
Saat ini:
```html
<!-- Flame SVG Background -->
<div class="w-36 h-36 sm:w-44 sm:h-44 flex items-center justify-center transition-all"
     :class="isStreakActive ? 'text-orange-500 animate-pulse' : 'text-stone-300'">
  <Icon name="lucide:flame" ... />
</div>
<!-- Streak text overlay -->
<div class="absolute inset-0 flex items-center justify-center pt-6">
  <span class="text-4xl sm:text-6xl font-black ...">
    {{ streak }}
  </span>
</div>
```

#### 2. Strategi Perubahan
1. Menyalin berkas `.agent/docs/FireStreak.svg` ke direktori publik `public/FireStreak.svg` atau membuat komponen inline `<FireStreakIcon />`.
2. Mengganti `<Icon name="lucide:flame" />` dengan aset `FireStreak.svg`.
3. Menyesuaikan styling:
   - Jika `isStreakActive === true`: Menampilkan api berwarna oranye menyala `#F56A16` dengan efek denyut halus (*ambient pulse glow*).
   - Jika `isStreakActive === false`: Menampilkan api dalam mode grayscale/stone muted dengan kontras teks angka yang tetap terbaca jelas.
4. Menjaga proporsi teks angka streak di baris 102 agar tetap berada di titik tengah visual lidah api.

---

### C. Tipografi Profesional: Plus Jakarta Sans

#### 1. Tag Sumber Font
Pengguna menginginkan penggunaan Google Font **Plus Jakarta Sans**:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&display=swap" rel="stylesheet">
```

#### 2. Langkah Konfigurasi
1. **`nuxt.config.ts`**:
   Menambahkan `app.head.link` berisi 3 tag di atas agar di-inject langsung ke elemen `<head>` SSR & client:
   ```ts
   export default defineNuxtConfig({
     app: {
       head: {
         link: [
           { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
           { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
           {
             rel: 'stylesheet',
             href: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&display=swap',
           },
         ],
       },
     },
     // ...
   })
   ```
2. **`tailwind.config.js`**:
   Memastikan `theme.extend.fontFamily.sans` memposisikan `'Plus Jakarta Sans'` pada prioritas teratas (sudah ada).
3. **`app/assets/css/main.css`**:
   Memastikan `body` memiliki `@apply font-sans antialiased;` agar seluruh hierarki teks ter-render dengan rapi.

---

## 3. Matriks Berkas yang Dimodifikasi & Dibuat

| No | Berkas | Operasi | Keterangan |
|---|---|---|---|
| 1 | `collaboration_docs/MASCOT_SIDEBAR_AND_UI_ENHANCEMENT_PLAN.md` | **Create/Update** | Berkas panduan & rencana teknis kolaborasi ini. |
| 2 | `collaboration_docs/README.md` | **Update** | Mendaftarkan dokumen rencana baru ke daftar indeks. |
| 3 | `app/components/SidebarMascot.vue` | **Create/Update** | Komponen maskot interaktif sisi kanan dengan eye tracking kursor, hover menyembul (-46px), dan klik keluar layar (+480px). |
| 4 | `app/pages/index.vue` | **Update** | Mengganti `<img>` `pomodoro_right_bar.svg` dengan `<SidebarMascot />`. |
| 5 | `app/pages/dashboard.vue` | **Update** | Mengganti `<img>` `pomodoro_right_bar.svg` dengan `<SidebarMascot />`. |
| 6 | `public/FireStreak.svg` | **Create/Copy** | Aset vektor api oranye resmi dari `.agent/docs/FireStreak.svg`. |
| 7 | `app/pages/gamification/stats.vue` | **Update** | Mengganti `lucide:flame` dengan `FireStreak.svg` di baris 90-109. |
| 8 | `nuxt.config.ts` | **Update** | Memuat Google Fonts Plus Jakarta Sans pada konfigurasi `app.head`. |

---

## 4. Rencana Tahapan Eksekusi (Implementation Steps)

1. **Tahap 1: Persiapan Font & Aset**
   - Inject Google Font *Plus Jakarta Sans* ke `nuxt.config.ts`.
   - Salin `FireStreak.svg` ke `public/FireStreak.svg`.

2. **Tahap 2: Pembaruan Halaman Gamifikasi (`stats.vue`)**
   - Perbarui baris 90–110 di `app/pages/gamification/stats.vue` menggunakan `FireStreak.svg`.
   - Uji tampilan state aktif vs non-aktif dan keterbacaan angka streak.

3. **Tahap 3: Pembuatan Komponen `SidebarMascot.vue`**
   - Bangun komponen Vue dengan SVG Podo beresolusi scalable tanpa efek glint pupil maupun blush.
   - Implementasikan listener `mousemove` untuk eye cursor tracking halus dalam batas rongga mata.
   - Buat respons hover di mana seluruh maskot menyembul lebih jauh ke arah kiri layar (`translateX(-46px)`) beserta speech bubble interaktif.
   - Buat penanganan klik reaktif: maskot meluncur sembunyi sepenuhnya ke kanan ke luar layar (`translateX(480px)`), lalu mengeksekusi `navigateTo('/chatbot')` setelah animasi tuntas (500ms).

4. **Tahap 4: Integrasi ke `index.vue` & `dashboard.vue`**
   - Gantikan elemen `<img src="/pomodoro_right_bar.svg" />` lama dengan `<SidebarMascot />`.
   - Pastikan layout responsive (hanya tampil pada layar `xl` ke atas sesuai desain desktop awal).

5. **Tahap 5: Verifikasi & Uji Visual**
   - Jalankan `npx nuxi typecheck` untuk memastikan tidak ada kesalahan TypeScript/Vue.
   - Pastikan dev server berjalan mulus tanpa error.


