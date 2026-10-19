# TKT-021: Download sertifikat publik (api)

| Field           | Nilai                             |
| --------------- | --------------------------------- |
| Area            | api                               |
| Prioritas       | P0                                |
| Ukuran          | M                                 |
| Status          | Todo                              |
| Bergantung pada | TKT-018 (uji penuh butuh TKT-019) |
| Membuka         | TKT-022                           |
| Asumsi terkait  | A9                                |

## Konteks

Halaman publik tanpa login: pengunjung memasukkan **nomor anggota + tanggal lahir**. Jika cocok,
tampil **sertifikat terbaru** member (hanya yang terbaru) dengan tombol PDF dan PNG. Jika tidak
cocok, **pesan umum yang sama**, tidak membedakan nomor salah atau tanggal salah. Ada **rate limit
per IP**. Tidak menampilkan profil member, hanya sertifikat.

Endpoint ini satu-satunya pintu publik ke data member, jadi keamanan dan privasi lebih penting
daripada kenyamanan.

## Tujuan

`POST /api/public/certificates/lookup` yang aman, dibatasi, dan hanya membuka data seperlunya.

## Scope

### Termasuk

- Modul `src/public-download/` (controller `@Public()`, service, dto, spec).
- `POST /api/public/certificates/lookup` body `{ memberNumber, birthDate }`.
- Rate limit per IP khusus endpoint ini.
- Konfigurasi `trust proxy` supaya IP asli terbaca di belakang reverse proxy.

### Tidak termasuk

- Halaman web (TKT-022).
- CAPTCHA, verifikasi QR, portal member.

## Bacaan wajib

- `docs/requirements.md` bagian Download publik, `docs/architecture.md` Alur sertifikat langkah 4,
  index `@@index([memberId, isActive, issuedAt])` di model `Certificate`, `StorageService`,
  konfigurasi throttler dari TKT-004, README tiket Asumsi A9.

## Langkah-langkah

1. **DTO**: `memberNumber` string di-trim, huruf besar, panjang wajar (maks 30); `birthDate`
   `YYYY-MM-DD` valid. Gunakan POST (bukan GET) agar tanggal lahir tidak masuk URL/log akses.
2. **Service**:
   - cari member by `memberNumber` persis; bandingkan `birthDate` sebagai tanggal (tanpa zona
     waktu);
   - ambil sertifikat `isActive = true` dan `status = READY` terbaru (`issuedAt` desc) milik
     member;
   - jika member tidak ada, tanggal tidak cocok, **atau** belum ada sertifikat siap (A9): lempar
     `NotFoundException` dengan pesan **sama persis**, misal
     `Data tidak ditemukan. Periksa kembali nomor anggota dan tanggal lahir.`;
   - jika cocok: buat dua presigned URL (PDF dan PNG) dengan TTL singkat (TTL default
     `S3_PRESIGN_TTL_SECONDS`), nama file `<nomor-sertifikat>.pdf|png`.
3. **Respons sukses** hanya berisi:
   `{ certificate: { number, issuedAt, examName, examDate, grade: "Sabuk Kuning, Kyu 9" atau
"Sabuk Hitam, Dan 2", memberName }, downloads: { pdf: url, png: url }, expiresAt }`.
   `memberName` boleh ditampilkan karena tercetak di sertifikat; jangan kirim alamat, telepon,
   cabang, tanggal lahir, id internal, atau riwayat.
4. **Waktu respons seragam**: jalur gagal dan sukses jangan berbeda mencolok. Minimal, lakukan
   query yang sama di semua jalur (jangan keluar lebih awal sebelum query sertifikat) dan tambahkan
   jeda kecil acak untuk jalur gagal bila perlu. Tulis alasannya di komentar.
5. **Rate limit**: `@Throttle` khusus endpoint ini, misal 10 permintaan per 15 menit per IP (nilai
   di env `PUBLIC_LOOKUP_LIMIT` dan `PUBLIC_LOOKUP_TTL_SECONDS`, tambahkan ke `.env.example` dan
   `loadEnv()`). Respons 429 dengan pesan Indonesia
   `Terlalu banyak percobaan. Coba lagi nanti.`
6. **IP asli**: env `TRUST_PROXY` (default `false`; isi `1` saat di belakang reverse proxy). Jika
   aktif, `app.set('trust proxy', ...)` di `main.ts`. Dokumentasikan di `apps/api/README.md`.
7. **Audit**: catat setiap lookup (`public.lookup`) dengan hasil `found`/`not_found` dan IP; jangan
   simpan tanggal lahir yang dimasukkan. `userId` kosong.
8. **Test**:
   - nomor salah, tanggal salah, dan member tanpa sertifikat menghasilkan status dan pesan identik;
   - yang cocok mengembalikan sertifikat terbaru (dua sertifikat, ambil yang `issuedAt` paling
     baru) dan hanya yang aktif + `READY`;
   - respons tidak mengandung field pribadi (cek key objek secara eksplisit);
   - throttle: permintaan ke-(limit+1) membalas 429.

## Jangan lakukan

- Jangan memakai GET dengan tanggal lahir di query string.
- Jangan membedakan pesan atau status HTTP antara "nomor tidak ada" dan "tanggal salah".
- Jangan mengembalikan id member, URL permanen, atau key storage.
- Jangan merender sertifikat di endpoint ini.
- Jangan menyalakan throttle global yang mengganggu endpoint admin.

## Best practice

- Normalisasi input (trim, huruf besar) sebelum mencari agar pengguna tidak gagal karena spasi.
- Satu query ber-index untuk sertifikat terbaru (`orderBy issuedAt desc, take 1`).

## Kriteria selesai

- [ ] Lookup cocok mengembalikan sertifikat terbaru dengan dua URL unduhan yang kedaluwarsa singkat.
- [ ] Semua jenis gagal mengembalikan respons identik.
- [ ] Rate limit per IP berjalan dan bisa dikonfigurasi lewat env.
- [ ] Respons tidak membocorkan data pribadi; lookup tercatat di audit tanpa tanggal lahir.
- [ ] `pnpm check` dan `pnpm format:check` lolos.

## Cara verifikasi

```bash
pnpm --filter @karate/api check
curl -s -H 'Content-Type: application/json' \
  -d '{"memberNumber":"M202600001","birthDate":"2012-05-01"}' \
  http://localhost:4000/api/public/certificates/lookup
pnpm check && pnpm format:check
```
