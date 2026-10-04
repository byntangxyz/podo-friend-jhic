# Instruksi Penyelesaian Phase 3 - Fix UI State & Model 9router

**Konteks Masalah:**
Arsitektur *end-to-end* chatbot sudah berhasil. Namun, ada dua kendala minor:

1. Model LLM yang diatur di sisi server (Nitro) sudah tidak tersedia di 9router, sehingga mengembalikan *error* ("Claude Opus 4.6 is no longer available").
2. Saat terjadi *error*, *frontend* berhasil menyimpannya ke *database*, namun UI tidak memperbarui gelembung obrolan yang sedang *loading* ("...") menjadi teks *error* secara *real-time*.

Tugas Anda adalah memperbarui konfigurasi model LLM dan memperbaiki reaktivitas *state* di `useAiChat.ts`.

---

## Langkah 1: Perbarui Model LLM di Server Nitro

Ubah nama model di file `server/api/ai/chat.post.ts` ke model yang didukung dan aktif di 9router.

1. Buka `server/api/ai/chat.post.ts`.
2. Cari konfigurasi inisialisasi LangChain (misalnya `new ChatOpenAI({ modelName: 'claude-3-opus' ... })`).
3. Ganti `modelName` tersebut menjadi model yang tersedia, misalnya `'gpt-4o'`, `'gpt-4-turbo'`, atau `'claude-3-5-sonnet-20240620'` (sesuaikan dengan dokumentasi/dashboard 9router yang Anda miliki).

## Langkah 2: Perbaiki Sinkronisasi UI Error di Frontend

Pastikan gelembung *chat* yang menampilkan animasi *loading* langsung berubah berisi teks *error* jika proses *fetch* atau *streaming* gagal.

1. Buka composable `useAiChat.ts`.
2. Di dalam fungsi `sendMessage`, cari blok `catch (err)`.
3. Di dalam blok `catch` tersebut, **pastikan Anda meng-update properti reaktif lokal** (seperti `aiMsg.message`) dengan teks *error* sebelum (atau sesudah) memanggil fungsi `chatStore.saveMessage()`.
*Contoh perbaikan logika:*
```typescript
catch (err: any) {
    console.error('[AI Chat Error]:', err);

    // 1. Definisikan pesan error
    const fallbackError = err.message || 'Maaf, PodoFriend sedang mengalami gangguan koneksi. Coba lagi ya!';

    // 2. UPDATE STATE LOKAL AGAR UI LANGSUNG BERUBAH (Hapus titik tiga)
    if (aiMsg) {
        aiMsg.message = fallbackError; 
    }

    // 3. Simpan ke database backend
    await chatStore.saveMessage('ai', fallbackError);
} finally {
    // 4. Matikan status loading global
    chatStore.setLoading(false);
}

```


4. Pastikan objek `aiMsg` yang Anda mutasi di dalam `catch` adalah referensi (objek reaktif) yang sama dengan yang didorong (*push*) ke dalam array `messages` di awal fungsi `sendMessage`. Dengan begitu, Vue akan langsung me-render ulang gelembung pesan seketika tanpa perlu *refresh* halaman.