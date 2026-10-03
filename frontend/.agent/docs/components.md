# Standar UI/UX & Komponen Global - PodoFriend

Dokumen ini berisi standar desain global dan panduan pembuatan komponen antarmuka untuk aplikasi PodoFriend berbasis Nuxt 4 dan Tailwind CSS. Panduan ini mengacu pada desain antarmuka Figma.

## 1. Palet Warna (Color Styles)

Tema aplikasi menggunakan nuansa oranye monokromatik yang hangat, bersih, dan tidak mengintimidasi. Konfigurasi warna ini harus ditetapkan sebagai warna tema utama di Tailwind:

- **Background Color (Krem/Off-white):** Gunakan kelas Tailwind `bg-orange-50` (atau hex `#FFF7ED`). Warna ini diaplikasikan pada latar belakang utama (_body_) seluruh halaman.

- **Primary Color (Oranye Cerah):** Gunakan kelas Tailwind `bg-orange-500` (atau hex `#F97316`). Warna ini adalah identitas utama aplikasi, digunakan untuk tombol CTA (Call to Action), pinggiran kartu (_border_), elemen interaktif pada _timer_, dan warna tubuh maskot.

- **Text Color (Hitam/Abu-abu Gelap):** Gunakan kelas Tailwind `text-stone-900` (atau hex `#1C1917` / `#1E1E1E`). Warna ini memastikan teks memiliki kontras yang sangat baik saat dibaca di atas latar belakang krem atau oranye.

- **Bubble Color (Abu-abu Terang):** Gunakan kelas Tailwind `bg-gray-100` (atau hex `#F3F4F6`). Warna netral ini secara spesifik digunakan sebagai latar belakang gelembung obrolan (_chat bubble_) dari AI atau area sekunder.

## 2. Tipografi & Bentuk (Typography & Shapes)

- **Font:** Gunakan jenis huruf (_font_) Sans-Serif yang memiliki karakter membulat (_rounded_) dan ramah. Bobot huruf (_font-weight_) yang tebal (`font-bold` atau `font-extrabold`) wajib digunakan pada angka timer Pomodoro (misal: 25:00) dan judul kartu.

- **Sudut Membulat (Border Radius):** Hampir seluruh elemen menggunakan sudut yang sangat melengkung. Terapkan kelas `rounded-2xl`, `rounded-3xl`, atau `rounded-full` pada tombol, kartu, dan kontainer _chat_.

- **Garis Tepi (Borders):** Kartu antarmuka sering kali dibatasi dengan garis tepi yang solid dan tegas menggunakan warna utama. Gunakan kelas `border-2 border-orange-500` pada kontainer utama seperti kartu _Mood Survey_ dan Pomodoro.

## 3. Panduan Komponen Global

### A. Base Button (Tombol Utama)

- **Gaya:** Latar belakang oranye cerah (`bg-orange-500`), teks warna putih atau hitam tebal (`font-bold`), dan sudut membulat penuh (`rounded-full` atau `rounded-xl`).

- **Interaksi:** Tambahkan efek _hover_ yang sedikit menggelapkan warna oranye (misal: `hover:bg-orange-600`) dan efek transisi yang mulus (`transition-colors duration-200`).

### B. Base Card (Kartu Kontainer)

- **Gaya:** Latar belakang krem (`bg-orange-50` atau `bg-white`), sudut melengkung besar (`rounded-3xl`), garis tepi oranye tebal (`border-2 border-orange-500`), dan bayangan lembut (`shadow-md`).

- **Penggunaan:** Komponen ini wajib digunakan sebagai wadah pembungkus (_wrapper_) untuk area _Survei Mood_, area _Timer Pomodoro_, dan area kartu _Progress/Leaderboard_.

### C. Chat Bubbles (Gelembung Obrolan)

- **Pesan Pengguna (User):** Gelembung diletakkan di sisi kanan, menggunakan latar belakang oranye utama (`bg-orange-500`) dengan teks putih, dan sudut membulat (`rounded-2xl`).

- **Pesan AI Companion:** Gelembung diletakkan di sisi kiri, menggunakan latar belakang abu-abu terang (`bg-gray-100`) atau krem, dengan teks hitam (`text-stone-900`). Selalu sertakan avatar maskot oranye berukuran kecil (misal: `w-8 h-8`) di samping gelembung pesan AI.

### D. Form Inputs (Input Teks)

- **Gaya:** Latar belakang putih/krem terang, teks gelap, garis tepi tipis berwarna oranye muda yang akan berubah menjadi `border-orange-500` saat dalam status _focus_. Sudut harus membulat (`rounded-xl`).

## 4. Maskot & Ikonografi

- **Maskot Blob:** Karakter gumpalan (_blob_) berwarna oranye cerah dengan dua titik mata dan mulut. Aset ini merupakan bagian integral dari UI. Posisikan maskot ini mengintip dari sudut kartu pada halaman Pomodoro, atau sebagai avatar mandiri di dalam area obrolan. terdapat motion animation di ./.agent/docs/mote.js

- \*_Ikon:_ Gunakan set ikon dengan gaya _solid_ atau tebal. Misalnya, ikon api berwarna oranye/emas untuk menandakan rentetan hari (_streak_), piala untuk pencapaian, serta wajah sederhana (senyum, datar, lelah) untuk survei _mood_.
