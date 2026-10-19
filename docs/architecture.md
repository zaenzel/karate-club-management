# Arsitektur

Dibangun dari nol, jalan lokal dulu, dirancang agar bisa naik ke server tanpa menulis ulang.

## Komponen

| Lapisan      | Pilihan                           | Keterangan                                                      |
| ------------ | --------------------------------- | --------------------------------------------------------------- |
| Web          | Next.js 16, React 19, Tailwind v4 | Dari `fe-template`, feature-based. Aturan: `apps/web/AGENTS.md` |
| API          | NestJS 12 (ESM), Zod              | REST di prefix `/api`. Satu modul per domain                    |
| Database     | PostgreSQL 17 + Prisma 7          | Skema di `packages/db`, driver adapter `@prisma/adapter-pg`     |
| File storage | MinIO (S3-compatible)             | Desain template, tanda tangan, hasil render sertifikat          |
| Infra lokal  | Docker Compose                    | Hanya PostgreSQL + MinIO. Web dan api jalan lewat pnpm          |

Port lokal: web 3000, api 4000, PostgreSQL 5433, MinIO 9000 (API) dan 9001 (console).

## Alur data

```
Browser → apps/web ──HTTP /api──▶ apps/api ──Prisma──▶ PostgreSQL
                                     └──S3 API──▶ MinIO (file sertifikat)
```

Web tidak mengakses database atau storage langsung. Semua lewat api.

## Alur sertifikat

1. Super Admin menutup event ujian (status selesai).
2. Api membuat riwayat tingkatan untuk peserta lulus, lalu membuat baris sertifikat berstatus
   `PENDING`.
3. Render: template (PDF A4) + data peserta + tanda tangan ketua menghasilkan PDF vektor dan PNG
   300 DPI. File disimpan di MinIO, baris sertifikat menjadi `READY` dengan `pdfKey`/`pngKey`.
4. Download publik mencari member by nomor anggota + tanggal lahir, mengambil sertifikat aktif
   terbaru, dan mengembalikan URL bertanda tangan (kedaluwarsa singkat) ke file yang sudah ada.

Kualitas sertifikat ditentukan sumber desain: PDF vektor dipakai sebagai latar, teks dinamis
ditimpa sebagai teks asli dengan font ter-embed. Jangan merender ulang saat unduhan.

## Yang sengaja belum dibuat

- **`apps/worker`**: render sertifikat di proses terpisah (antrian BullMQ + Redis, Chromium
  headless atau `pdf-lib`). Dibuat setelah file desain PDF tersedia, karena cara render bergantung
  pada isi PDF-nya. Sampai itu, Redis belum ada di `docker-compose.yml`.
- **`packages/shared`**: tipe/skema Zod yang dipakai web dan api. Dibuat saat ada kode yang
  benar-benar dipakai bersama.
- **Auth**: Super Admin login (JWT, httpOnly cookie, argon2). Dibuat bersama modul pertama yang
  butuh proteksi.

## Jalur scaling

1. **Sekarang**: semua di laptop (Docker Compose untuk PostgreSQL + MinIO).
2. **Pilot**: satu VPS kecil, compose yang sama, reverse proxy + HTTPS, web dan api sebagai
   container.
3. **Tumbuh**: pindahkan state keluar dari VPS (PostgreSQL managed, MinIO ke Cloudflare R2/S3);
   cukup ganti env `DATABASE_URL` dan `S3_*`.
4. **Besar**: scale api dan worker horizontal terpisah (worker saat musim ujian).

## Konvensi api

- ESM (`"type": "module"`): import relatif memakai ekstensi `.js`.
- Env lewat `loadEnv()` (`apps/api/src/config/env.ts`). Saat development, `.env` root dibaca otomatis.
- Satu folder per domain di `apps/api/src/<domain>/` berisi module, controller, service, DTO (Zod),
  dan test.
- Aturan yang tidak bisa diekspresikan di skema (hitam hanya bila kyu 0, kyu 0 sampai 10, satu
  sertifikat aktif per peserta) ditegakkan di service dan diuji.
