# Instruksi Pengembangan Frontend - PodoFriend (Perombakan Halaman Utama & Tasks)

**Konteks Sistem:**
Anda adalah AI Developer Agent (Nuxt 4, Vue 3, Tailwind CSS). Tugas Anda saat ini difokuskan secara eksklusif untuk merombak halaman utama (`pages/index.vue`), mengintegrasikan UI *To-Do List* ("My Task"), dan membuat *Toast Notification* untuk pencapaian.

---

## Langkah 1: Rombak Halaman Utama (`pages/index.vue`)

Ubah rute *root* (`/`) agar langsung memberikan nilai kepada pengguna (*immediate value*) dengan menampilkan Timer sebagai elemen utama.

1. **Logika Hibrida (Guest vs Logged In):**
* Hapus desain *landing page* lama yang berisi sekadar teks *hero* dan gambar.
* Pindahkan dan render komponen `PomodoroTimer.vue` tepat di tengah halaman.
* Gunakan data dari Pinia `auth` store untuk menentukan tampilan pendukung:
* **Jika Guest (Belum Login):** Tampilkan Timer menggunakan *layout* default polos. Di bawah komponen Timer, tambahkan *banner* CTA (*Call to Action*) yang menarik (misal: kotak dengan latar `bg-orange-100` dan teks oranye gelap) bertuliskan *"Login untuk menyimpan sesi belajar, mencatat tugas, dan berinteraksi dengan AI Companion!"* beserta tombol menuju `/login`.
* **Jika Logged In (Sudah Login):** Gunakan `layouts/dashboard.vue`. Tampilkan Timer dan letakkan komponen `TaskList.vue` (My Task) berdampingan di sebelah kirinya pada tampilan *desktop*.





## Langkah 2: Komponen "My Task" (`components/TaskList.vue`)

Buat UI pengelola tugas harian yang bisa dicentang pengguna.

1. **Desain Komponen:**
* Bungkus dalam `BaseCard` dengan tajuk "My Task" berlatar blok oranye di bagian atas (sesuai desain).
* Tambahkan *input field* sederhana dan tombol "Tambah" di atas daftar tugas untuk memanggil aksi `addTask()` ke *backend* `/api/tasks`.
* **List Item:** Tampilkan data dari state Pinia `taskStore`. Gunakan elemen *checkbox*. Jika status `is_completed` bernilai *true*, ubah teks menjadi tercoret (`line-through`) dan pudar (`text-gray-400`).
* Tambahkan tombol hapus (ikon tempat sampah) yang muncul saat pengguna mengarahkan kursor (*hover*) ke item tugas.



## Langkah 3: Sistem Toast Notification (Pencapaian Baru)

Buat pemberitahuan visual berdurasi singkat saat pengguna mendapatkan *achievement* baru setelah menyelesaikan sesi timer.

1. **Komponen `components/AppToast.vue`:**
* Buat elemen *toast* melayang menggunakan posisi absolut/fixed (`fixed top-10 left-1/2 -translate-x-1/2 z-50`).
* Desain berbentuk pil atau kapsul membulat dengan latar krem/putih dan ikon api oranye, berisi teks dinamis (contoh: "Kamu membuka Streak Belajar!").
* Gunakan Vue `<Transition>` untuk animasi *fade-in/slide-down* saat muncul, lalu hilangkan otomatis setelah 3-4 detik.


2. **Pemicu dari Timer:**
* Pada `stores/timer.ts`, modifikasi fungsi `stopSession()`.
* Saat menerima *response* `PUT /api/sessions/{id}` yang sukses dari *backend*, periksa objek `response.meta.newly_unlocked_achievements`.
* Jika array tersebut tidak kosong, panggil `AppToast` untuk muncul ke layar.