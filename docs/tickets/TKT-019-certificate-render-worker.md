# TKT-019: Render sertifikat PDF vektor + PNG 300 DPI (apps/worker)

| Field           | Nilai                                    |
| --------------- | ---------------------------------------- |
| Area            | worker / api / infra                     |
| Prioritas       | P0                                       |
| Ukuran          | L                                        |
| Status          | Review                                   |
| Bergantung pada | TKT-018, TKT-017, jawaban A12 sampai A14 |
| Membuka         | unduhan nyata di TKT-020 dan TKT-021     |
| Asumsi terkait  | -                                        |

## Konteks

Keputusan klien: sertifikat diunduh sebagai **PDF (vektor)** dan **PNG (300 DPI)** tanpa penurunan
kualitas, **dirender sekali** lalu disimpan; unduhan mengambil file yang sama. Arsitektur menunda
`apps/worker` (antrian BullMQ + Redis) sampai desain tersedia, karena cara render bergantung pada
isi PDF desain.

Catatan desain: halaman memuat garis titik-titik isian di belakang teks dinamis; teks harus
ditaruh di atas garis tersebut dengan baseline yang pas, dan `fieldLayout` dites visual.

Pendekatan yang direncanakan di `docs/architecture.md`: PDF desain dipakai sebagai latar (tetap
vektor), teks dinamis ditimpa sebagai **teks asli dengan font ter-embed**, tanda tangan ditempel
sebagai gambar. PNG dihasilkan dengan merasterisasi PDF hasil render pada 300 DPI (A4 **lanskap** =
3508 × 2480 piksel; desain klien berorientasi lanskap).

## Tujuan

Sertifikat `PENDING` dirender menjadi PDF + PNG, disimpan di storage, dan berstatus `READY`; gagal
menjadi `FAILED` dengan cara mencoba ulang.

## Prasyarat sebelum mulai (cek dulu, jangan mulai jika belum ada)

- [x] Desain diterima dari user (A4 lanskap 842 × 595 pt, 1 halaman). Jangan commit; minta user
      mengunggahnya sebagai template aktif lewat TKT-017 atau kirim file lewat thread.
- [x] Nama ketua dan tanda tangan sudah tercetak di desain: **tidak perlu menempel tanda tangan**
      dan `signatureKey` boleh kosong.
- [ ] Font untuk teks dinamis: desain memakai huruf serif (mirip Alike/Alegreya); font teks tetap
      sudah berupa outline sehingga aman. Pilih font bebas lisensi (OFL) yang mirip, minta
      persetujuan user, dan simpan di storage, bukan di repo.
- [x] A12, A13, A14 terjawab: pakai default (Ranting tidak dicetak, tanggal tetap dibiarkan, teks sabuk sesuai A14).
- [ ] Daftar field dicocokkan (langkah 1).

## Scope

### Termasuk

- Redis di `docker-compose.yml` + env `REDIS_URL`.
- `apps/worker` (workspace baru, Node ESM + TypeScript, vitest, oxlint mengikuti `apps/api`).
- Antrian BullMQ `certificate-render`; implementasi `CertificateRenderQueue` di api yang
  menggantikan no-op TKT-018.
- Isi `fieldLayout` template untuk desain klien.
- Endpoint api `POST /api/certificates/:id/retry` untuk sertifikat `FAILED`.

### Tidak termasuk

- Editor visual posisi field.
- Verifikasi QR (ditunda).
- Render ulang saat unduhan (dilarang).

## Bacaan wajib

- `docs/architecture.md` (Alur sertifikat, Yang sengaja belum dibuat, Jalur scaling),
  `docs/requirements.md` bagian Sertifikat, TKT-016 sampai TKT-018, model `Certificate` dan
  `CertificateTemplate`.

## Langkah-langkah

1. **Sepakati field cetak** dengan user dan tulis di `docs/requirements.md`, field pada desain klien:
   - Nama: nama member;
   - Tempat/tanggal lahir: `birthPlace, 12 Mei 2012` (format Indonesia);
   - Cabang: nama cabang member; Ranting: sesuai A12 (default tidak dicetak);
   - tanggal tes: tanggal ujian, "bertempat di": lokasi ujian;
   - "berhak memakai sabuk": teks tingkatan hasil sesuai A14;
   - nomor sertifikat belum ada tempatnya di desain: user setuju default: cetak kecil di pojok bawah kiri;
   - "Depok, 31 Maret 2026", nama ketua, "Karate DAN III", dan tanda tangan: teks tetap pada
     desain (A13).
2. **Definisikan `fieldLayout`** (JSON) dan schema Zod-nya: per field `x`, `y` (pt dari kiri bawah
   halaman), `fontSize`, `align` (`left`/`center`/`right`), `maxWidth` (teks panjang diperkecil
   otomatis sampai batas minimum), warna. Tanda tangan tidak perlu karena sudah ada di desain; dukung `signature` opsional (`x`, `y`, `width`) hanya jika template memakainya. Isi nilai sesuai
   desain klien dan simpan ke template aktif (lewat skrip atau endpoint `PATCH` TKT-017).
3. **Infra**: tambah service `redis` (image resmi, port host dari env, healthcheck) ke
   `docker-compose.yml`, `REDIS_URL` ke `.env.example`, dan perbarui `docs/architecture.md` serta
   port lokal di `AGENTS.md`.
4. **Buat `apps/worker`**: `package.json` (`@karate/worker`, `type: module`, script `dev`,
   `build`, `start`, `lint`, `typecheck`, `test`), `src/config/env.ts` (pola sama dengan api),
   `src/main.ts` (BullMQ `Worker`), `README.md`. Worker memakai `@karate/db` dan konfigurasi
   storage yang sama (salin `StorageService` minimal atau pindahkan ke paket bersama hanya jika
   memang dipakai dua app; tanyakan bila ragu, ingat aturan `packages/shared`). Tambah script
   `dev:worker` di root.
5. **Antrian**: api menambahkan job `{ certificateId }` dengan `jobId = certificateId` (mencegah
   duplikat), `attempts: 3`, backoff eksponensial.
6. **Render PDF** dengan `pdf-lib` + `@pdf-lib/fontkit`:
   - muat PDF desain dari storage, embed font klien (subset), tulis teks sesuai `fieldLayout`,
     tempel PNG tanda tangan;
   - jangan merasterisasi desain; hasil harus tetap vektor (teks bisa diseleksi);
   - set metadata PDF (judul berisi nomor sertifikat).
7. **Render PNG 300 DPI** dari PDF hasil langkah 6 memakai rasterizer yang andal (misal
   `pdftoppm -r 300 -png` dari poppler, atau MuPDF). Pastikan alat itu terdokumentasi sebagai
   kebutuhan sistem di `apps/worker/README.md` dan tersedia di image Docker nanti. Set metadata
   DPI PNG (pHYs 300 DPI).
8. **Simpan** keduanya ke key `certificates/<tahun>/<certificateId>.pdf|png`, lalu update baris:
   `status = READY`, `pdfKey`, `pngKey`. Gagal setelah semua percobaan: `status = FAILED` (simpan
   pesan error ringkas di log, bukan data pribadi).
9. **Idempoten**: jika baris sudah `READY`, job selesai tanpa render ulang. Jika sertifikat sudah
   tidak aktif (diterbitkan ulang), lewati.
10. **Retry**: `POST /api/certificates/:id/retry` mengubah `FAILED` menjadi `PENDING` dan enqueue.
11. **Test**: unit untuk pemetaan data ke teks (format tanggal, tingkatan, teks panjang mengecil),
    render PDF dengan fixture desain dummy menghasilkan PDF valid A4 berisi teks yang diharapkan
    (ekstrak teks dan cek), PNG berukuran 3508 × 2480 (lanskap; ikuti orientasi halaman desain).
12. Uji visual dengan user: kirim contoh PDF dan PNG hasil render untuk disetujui sebelum PR siap
    merge.

## Jangan lakukan

- Jangan mulai sebelum prasyarat terpenuhi; jangan menebak desain.
- Jangan merender saat unduhan atau di request HTTP api.
- Jangan mengonversi PDF ke gambar lalu kembali ke PDF (kualitas turun).
- Jangan commit desain, font berlisensi, atau tanda tangan asli ke repo; fixture test buatan
  sendiri.
- Jangan memakai Chromium headless jika `pdf-lib` cukup; bila terpaksa, diskusikan dulu.

## Best practice

- Pisahkan "data sertifikat" (fungsi murni dari database ke objek teks) dari "renderer" agar mudah
  diuji.
- Log per job berisi `certificateId` dan durasi, tanpa nama atau tanggal lahir member.
- Konkurensi worker dibatasi (misal 2) agar laptop tidak kewalahan saat musim ujian.

## Kriteria selesai

- [ ] Menutup ujian menghasilkan sertifikat `READY` dengan file PDF dan PNG di MinIO.
- [ ] PDF vektor (teks bisa diseleksi, font ter-embed), A4; PNG 300 DPI ukuran penuh A4 lanskap (3508 × 2480).
- [ ] Gagal render menjadi `FAILED` dan bisa di-retry.
- [ ] Job duplikat tidak membuat file ganda; sertifikat nonaktif dilewati.
- [ ] Contoh hasil disetujui user.
- [ ] `pnpm check` dan `pnpm format:check` lolos, CI ikut menjalankan workspace worker.

## Cara verifikasi

```bash
pnpm infra:up      # termasuk redis
pnpm dev:api & pnpm dev:worker
# tutup ujian berisi peserta lulus, lalu cek status sertifikat dan file di MinIO console
pdffonts <hasil>.pdf          # font ter-embed
pdfinfo <hasil>.pdf           # Page size: 842 x 595 pts (A4 lanskap)
file <hasil>.png              # 3508 x 2480
pnpm check && pnpm format:check
```
