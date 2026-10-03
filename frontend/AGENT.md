# Nuxt 4 AI Agent Rules

## Konteks Dokumentasi Proyek
PENTING: Informasi detail mengenai arsitektur, skema database, dan aturan spesifik proyek ini telah dipisahkan. Anda WAJIB membaca file di `./.agents/docs/` sebelum menulis kode besar:
- Lihat `./.agents/docs/architecture.md` untuk gambaran umum sistem.
- Lihat `./.agents/docs/components.md` untuk standar UI/UX global.

## Standar Proyek (Nuxt 4)
- Gunakan struktur folder Nuxt 4 (secara default semua kode aplikasi utama berada di direktori `app/`, bukan di root, kecuali dikonfigurasi lain).
- Gunakan Vue 3 Composition API dengan `<script setup>`.
- Prioritaskan fitur bawaan Nuxt 4 seperti auto-imports untuk composables, components, dan utilities.
- Gunakan TypeScript strict mode untuk semua file `.vue` dan `.ts`.

## Perintah Utama (Commands)
- Pemasangan dependensi: `pnpm install`
- Menjalankan server lokal: `pnpm dev`
- Membuat build produksi: `pnpm build`
- Linter dan pemeriksaan tipe: `pnpm lint` & `pnpm typecheck`
