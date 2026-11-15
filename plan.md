# Berbagi File

## Tujuan
Memudahkan guru dan masyarakat di sekitar sekolah untuk berbagi serta mengunduh file.

Jenis file yang didukung: `.pdf`, `.docx`, `.xlsx`, `.odt`, `.ppt`, `.psd`, `.svg`.

## Fitur
- Unggah file (dengan judul dan deskripsi)
- Daftar file yang bisa diunduh
- Unduh file lewat tautan aman
- Notifikasi email setiap ada unggahan baru
- Login pengguna

## Tech Stack
- **Next.js 16** (App Router) + **React 19**
- **Neon** — database Postgres ([`db/schema.sql`](db/schema.sql))
- **Clerk** — autentikasi
- **Resend** — notifikasi email
- **Cloudflare R2** — penyimpanan file (presigned upload/download)
- **Cloudflare Workers** — hosting, lewat `@opennextjs/cloudflare` + Wrangler

## Alur Singkat
1. Pengguna login dengan Clerk.
2. Unggah file: server membuat presigned URL ke R2, file diunggah langsung, lalu metadata disimpan di Neon.
3. Pengguna lain melihat daftar file dan mengunduh lewat presigned URL.
4. Setiap unggahan baru mengirim email notifikasi via Resend.

## Menjalankan Proyek
1. Salin `.env.example` menjadi `.env.local` dan isi kunci Clerk, `DATABASE_URL`, R2, dan Resend.
2. Terapkan skema database: `psql "$DATABASE_URL" -f db/schema.sql`.
3. Jalankan `npm run dev` (atau `npm run build:webpack` di Termux).

## Deploy
Deploy berjalan otomatis lewat GitHub Actions (`.github/workflows/deploy.yml`) saat push ke `main`.
Target hosting: **Cloudflare Workers** menggunakan OpenNext.
