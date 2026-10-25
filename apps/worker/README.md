# @karate/worker

Background worker untuk merender sertifikat kenaikan sabuk karate (PDF vektor dan rasterisasi PNG 300 DPI) menggunakan BullMQ dan Redis.

## Kebutuhan Sistem

- **Node.js**: >= 22 (ESM)
- **Redis**: Versi 7+ (tersedia di `docker-compose.yml`)
- **Poppler Utils (`pdftoppm`)**: Digunakan untuk rasterisasi PNG 300 DPI dari PDF vektor.
  - Di Debian/Ubuntu: `sudo apt-get install poppler-utils`
  - Di Fedora/RHEL: `sudo dnf install poppler-utils`
  - Di macOS: `brew install poppler`

## Cara Menjalankan

```bash
# Dari root
pnpm infra:up     # menyalakan Postgres, MinIO, dan Redis
pnpm dev:worker   # menjalankan worker dalam mode development (watch)
pnpm --filter @karate/worker check # lint + typecheck + test
```

## Alur Kerja Render

1. Worker mendengarkan antrian BullMQ `certificate-render`.
2. Saat menerima job `{ certificateId }`:
   - Mengambil data relasional sertifikat (member, ujian, grade history hasil, template).
   - Memastikan idempoten: jika sudah `READY` atau tidak aktif, lewati.
   - Mengunduh PDF desain template dan gambar tanda tangan dari MinIO/S3.
   - Menghasilkan PDF vektor dengan menyematkan teks dinamis menggunakan font serif berlisensi bebas (`DejaVuSerif.ttf`).
   - Merasterisasi halaman sertifikat menjadi PNG beresolusi 300 DPI (A4 lanskap: 3508 × 2480 piksel) via `pdftoppm`.
   - Mengunggah file PDF dan PNG ke storage (`certificates/<tahun>/<certificateId>.pdf|png`).
   - Memperbarui status sertifikat menjadi `READY`.
3. Jika gagal setelah 3 kali percobaan: status ditandai `FAILED` agar dapat dicoba ulang (retry) oleh admin.
