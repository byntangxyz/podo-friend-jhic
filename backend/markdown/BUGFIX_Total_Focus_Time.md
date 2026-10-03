# Instruksi Perbaikan Bug: Kalkulasi Durasi Sesi (duration_minutes bernilai 0)

**Konteks Isu:**
Saat ini, jika pengguna menyelesaikan sesi Pomodoro dalam waktu kurang dari 60 detik (misalnya 32 detik untuk testing), nilai `duration_minutes` dan `total_focus_time` tercatat sebagai `0`. Hal ini terjadi karena fungsi bawaan Carbon seperti `diffInMinutes()` membulatkan nilai ke bawah (floor) untuk sisa detik yang tidak mencapai 1 menit penuh.

**Tujuan:**
Memperbaiki logika kalkulasi selisih waktu pada `SessionController` (atau _Action class_ terkait) agar sistem menghargai sesi berdurasi pendek, minimal dibulatkan menjadi 1 menit, sehingga pengujian (testing) dan pencatatan riwayat tetap berjalan dengan benar.

---

## Langkah Perbaikan

### 1. Perbarui Logika Kalkulasi Durasi

Temukan bagian kode di mana Anda mengatur `end_time` dan menghitung `duration_minutes` (kemungkinan di `SessionController@complete` atau _Action class_ yang menangani penyelesaian sesi).

**Ubah logika kalkulasinya menjadi berbasis detik, lalu bulatkan ke atas:**
Jangan gunakan `$start->diffInMinutes($end)`. Ganti dengan `$start->diffInSeconds($end)`.

**Contoh Implementasi Kode:**

```php
// Ambil instance Carbon dari start_time dan end_time
$startTime = Carbon::parse($session->start_time);
$endTime = Carbon::now();

// Hitung selisih dalam detik
$durationInSeconds = $startTime->diffInSeconds($endTime);

// Konversi ke menit dan bulatkan ke atas (ceil)
// Gunakan max(1, ...) agar sesi yang sangat singkat (misal 5 detik) tetap terhitung 1 menit.
// Jika sesi 0 detik (start dan stop di detik yang sama), biarkan 0.
if ($durationInSeconds > 0) {
    $durationMinutes = (int) max(1, ceil($durationInSeconds / 60));
} else {
    $durationMinutes = 0;
}

// Simpan ke database
$session->update([
    'end_time' => $endTime,
    'duration_minutes' => $durationMinutes,
]);
```
