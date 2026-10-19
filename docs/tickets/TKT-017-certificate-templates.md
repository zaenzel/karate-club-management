# TKT-017: Template sertifikat (api + web)

| Field           | Nilai            |
| --------------- | ---------------- |
| Area            | api / web        |
| Prioritas       | P0               |
| Ukuran          | M                |
| Status          | Todo             |
| Bergantung pada | TKT-005, TKT-016 |
| Membuka         | TKT-018          |
| Asumsi terkait  | -                |

## Konteks

Satu desain PDF A4 dipakai untuk semua jenis ujian. Sertifikat ditandatangani **ketua club saja**:
nama ketua + gambar tanda tangan disimpan di template. File desain **belum dikirim klien**, tetapi
pengelolaan template bisa dibangun sekarang dan diuji dengan PDF A4 contoh buatan sendiri.

Model `CertificateTemplate`: `name`, `fileKey` (PDF desain), `signatureKey?`, `signerName`,
`signerTitle` (default "Ketua"), `paperSize` (default "A4"), `fieldLayout?` (JSON posisi field),
`isActive`.

## Tujuan

Admin bisa mengunggah desain PDF dan tanda tangan, mengisi nama penandatangan, dan menandai satu
template aktif.

## Scope

### Termasuk

- Api: `GET /api/certificate-templates`, `GET /:id`, `POST` (multipart: `design` PDF wajib,
  `signature` PNG opsional, `name`, `signerName`, `signerTitle`), `PATCH /:id` (metadata + ganti
  file opsional), `POST /:id/activate`, `GET /:id/files/design` dan `/signature` (presigned URL
  untuk pratinjau admin).
- Aturan: hanya satu template aktif.
- Web: fitur `certificate-templates` di `/certificate-templates` (daftar, unggah, ubah, aktifkan,
  pratinjau).

### Tidak termasuk

- Editor posisi field visual. `fieldLayout` cukup disimpan sebagai JSON dan diisi saat TKT-019
  (setelah desain klien datang).
- Render sertifikat.
- Menghapus template yang sudah dipakai sertifikat.

## Bacaan wajib

- `docs/requirements.md` bagian Sertifikat, `docs/architecture.md` bagian Alur sertifikat, model
  `CertificateTemplate`, `StorageService` (TKT-016).

## Langkah-langkah

1. **Upload di api**: pakai `FileInterceptor`/`FileFieldsInterceptor` bawaan `@nestjs/platform-express`
   dengan penyimpanan memori dan batas ukuran (desain maks 20 MB, tanda tangan maks 2 MB).
2. **Validasi file dari isinya, bukan dari nama/extension**:
   - desain: diawali magic bytes `%PDF-`; cek halaman pertama berukuran A4 (595 × 842 pt, toleransi
     ± 2 pt, potret atau lanskap) dengan `pdf-lib` (`PDFDocument.load`, `getPage(0).getSize()`);
     tolak 400 bila bukan A4 atau PDF rusak/terenkripsi;
   - tanda tangan: magic bytes PNG; sarankan latar transparan (cukup keterangan di UI).
3. **Simpan**: buat baris template dulu untuk mendapatkan id, upload ke key sesuai konvensi TKT-016,
   lalu simpan `fileKey`/`signatureKey`. Jika upload gagal, batalkan baris (hapus atau transaksi
   kompensasi) sehingga tidak ada baris yatim.
4. **Aktivasi**: dalam transaksi, set semua `isActive = false`, lalu yang dipilih `true`. Template
   pertama yang dibuat otomatis aktif.
5. **Ganti file**: file lama boleh ditimpa di key yang sama **hanya jika** template belum dipakai
   sertifikat mana pun; jika sudah dipakai, tolak 409 dan minta admin membuat template baru (supaya
   sertifikat lama tetap bisa dirender ulang dengan desain aslinya).
6. Audit create/update/activate.
7. Test api: PDF valid A4 diterima, PDF bukan A4 ditolak, file PNG berlabel `.pdf` ditolak,
   aktivasi menonaktifkan yang lain, ganti file template terpakai ditolak.
8. **Web** fitur `src/features/certificate-templates`:
   - list (nama, penandatangan, aktif, tanggal), form unggah (input file `accept` PDF/PNG, nama,
     nama ketua, jabatan), tombol "Jadikan aktif", pratinjau desain (buka presigned URL di tab baru)
     dan gambar tanda tangan;
   - upload memakai `FormData` lewat fungsi di `api/` (axios mendukung multipart; jangan set
     `Content-Type` manual);
   - schema + test, komponen dumb + test.
9. Simpan PDF contoh A4 kosong kecil untuk test di `apps/api/test/fixtures/` (buat sendiri dengan
   `pdf-lib`, bukan file desain klien).

## Jangan lakukan

- Jangan commit file desain atau tanda tangan asli klien ke repo (aturan AGENTS.md).
- Jangan mempercayai `mimetype` dari browser saja.
- Jangan menyimpan file di filesystem server.
- Jangan membuat editor drag-and-drop posisi field di tiket ini.

## Best practice

- Batasi ukuran file di interceptor sebelum file dibaca seluruhnya.
- Kirim balik template tanpa key mentah; web memakai endpoint presigned untuk pratinjau.

## Kriteria selesai

- [ ] Template bisa dibuat dengan PDF A4 dan PNG tanda tangan; file tersimpan di MinIO.
- [ ] File bukan A4 atau bukan PDF ditolak dengan pesan jelas.
- [ ] Hanya satu template aktif.
- [ ] Halaman web berfungsi untuk daftar, unggah, aktifkan, pratinjau.
- [ ] Test lolos; `pnpm check` dan `pnpm format:check` lolos.

## Cara verifikasi

```bash
pnpm --filter @karate/api check
pnpm --filter @karate/web check
pnpm check && pnpm format:check
```

## Catatan

- Pertanyaan terbuka di requirements: file desain + font, nama ketua dan tanda tangannya. Tiket ini
  tidak menunggu jawabannya.
