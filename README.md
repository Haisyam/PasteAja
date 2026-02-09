# PasteAja

PasteAja adalah aplikasi pastebin aman berbasis Next.js App Router, shadcn/ui, dan Turso (libSQL).

## Fitur Utama

- Buat paste dengan opsi:
  - Judul opsional
  - Masa aktif (`10m`, `1h`, `1d`, `1w`, `never`)
  - Visibilitas (`public`, `unlisted`)
  - Password opsional (disimpan sebagai hash bcrypt)
- Access Key otomatis saat membuat paste untuk otorisasi edit/hapus
- Edit konten + judul dengan:
  - Unlock access key via modal
  - Autosave setiap 5 detik saat ada perubahan
  - Tombol simpan manual
- Hapus paste (hanya jika access key valid)
- Paste diproteksi password:
  - Selalu minta password saat akses ulang
  - Tidak bergantung cookie/cache unlock untuk membuka ulang
- Endpoint raw: `/raw/[id]`
- Rate limiting untuk endpoint sensitif (create/unlock/edit/delete)
- Header keamanan dasar (CSP, nosniff, frame-ancestors, referrer-policy, dll)
- Logging aman (tanpa log isi paste dan password)
- Tema light/dark + UI responsif
- Metadata share:
  - Favicon custom
  - Open Graph image
  - Twitter image

## Teknologi

- Next.js (App Router)
- shadcn/ui (komponen lokal)
- Turso / libSQL (`@libsql/client`)
- Zod (validasi)
- bcryptjs (hash password/access key)
- motion (animasi)
- next-themes, sonner, lucide-react

## Variabel Environment

Salin file contoh:

```bash
cp .env.example .env.local
```

Isi variabel berikut:

- `TURSO_DATABASE_URL` (wajib)
- `TURSO_AUTH_TOKEN` (wajib)
- `APP_BASE_URL` (opsional)

## Cara Menjalankan

1. Install dependency

```bash
npm install
```

2. Jalankan migrasi database

```bash
npm run db:migrate
```

3. Jalankan server development

```bash
npm run dev
```

Alternatif (tanpa Turbopack):

```bash
npm run dev:webpack
```

4. Buka `http://localhost:3000`

## Skrip NPM

- `npm run dev` -> jalankan app mode development
- `npm run dev:webpack` -> development mode dengan webpack
- `npm run build` -> build production
- `npm run start` -> jalankan hasil build
- `npm run lint` -> linting
- `npm run db:migrate` -> jalankan semua file migrasi SQL

## Struktur Proyek

```txt
src/
  app/
    (site)/
    api/
  components/
    paste/
    shared/
    ui/
  lib/
  server/
    repositories/
    services/
    validators/
migrations/
scripts/
```

## Catatan Keamanan

Analisis keamanan lengkap ada di:

- [`SECURITY_ANALYSIS.md`](SECURITY_ANALYSIS.md)
