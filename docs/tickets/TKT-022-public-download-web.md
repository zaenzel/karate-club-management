# TKT-022: Halaman download sertifikat publik (web)

| Field           | Nilai            |
| --------------- | ---------------- |
| Area            | web              |
| Prioritas       | P0               |
| Ukuran          | M                |
| Status          | Todo             |
| Bergantung pada | TKT-005, TKT-021 |
| Membuka         | TKT-023          |
| Asumsi terkait  | A9               |

## Konteks

Halaman tanpa login untuk member atau orang tua mengunduh sertifikat terbaru. Pengguna awam,
kemungkinan besar membuka dari HP, jadi halaman harus sederhana, cepat, dan jelas.

## Tujuan

Halaman `/download` dengan form nomor anggota + tanggal lahir, menampilkan kartu sertifikat terbaru
dengan tombol "Unduh PDF" dan "Unduh PNG".

## Scope

### Termasuk

- Fitur `src/features/public-download`.
- Route `src/app/download/page.tsx` di **luar** route group `(dashboard)` dengan layout publik
  sederhana (tanpa navigasi admin).
- Pengecualian route ini di proxy auth (TKT-005).

### Tidak termasuk

- Profil member, riwayat, daftar semua sertifikat.
- CAPTCHA.

## Bacaan wajib

- Kontrak TKT-021, `apps/web/AGENTS.md`, `proxy.ts` dari TKT-005, README tiket Asumsi A9.

## Langkah-langkah

1. Fitur: `types/`, `api/lookup-certificate.ts` (`useMutation`, karena POST dan hasilnya tidak
   di-cache), `schemas/lookup-schema.ts` (nomor anggota wajib, tanggal lahir wajib dan valid;
   pesan Indonesia) + test.
2. Komponen dumb + test:
   - `lookup-form.tsx`: label "Nomor anggota" dan "Tanggal lahir" (`type="date"`), tombol
     "Cari sertifikat", contoh format nomor di keterangan;
   - `certificate-result.tsx`: nomor sertifikat, nama, tingkatan, nama ujian, tanggal; tombol
     "Unduh PDF" dan "Unduh PNG" (anchor ke URL dari api); keterangan "Tautan berlaku sampai
     <jam>" dari `expiresAt`;
   - state gagal: tampilkan pesan dari api apa adanya dengan `role="alert"`; 429 menampilkan
     pesan batas percobaan.
3. Container `public-download-container.tsx` menggabungkan form dan hasil. Setelah tautan
   kedaluwarsa, tombol meminta pengguna mencari ulang.
4. Halaman tipis dengan metadata judul "Unduh Sertifikat" dan `robots: noindex` tidak perlu
   (halaman memang publik), cukup deskripsi singkat.
5. Pastikan `proxy.ts` mengecualikan `/download` sehingga tidak diarahkan ke `/login`.
6. Tampilan mobile-first: lebar penuh di HP, kartu terpusat di desktop. Uji di lebar 360 px.

## Jangan lakukan

- Jangan menyimpan nomor anggota atau tanggal lahir di URL, `localStorage`, atau log.
- Jangan membuat pesan gagal sendiri yang membedakan penyebab; pakai pesan api.
- Jangan menampilkan data member selain yang dikirim api.
- Jangan import fitur lain.

## Best practice

- Tombol cari nonaktif saat request berjalan untuk menghindari klik berulang (dan menghabiskan
  kuota rate limit).
- Teks bantuan singkat: "Nomor anggota tertera di kartu anggota" (sesuaikan bila user punya
  kalimat sendiri).

## Kriteria selesai

- [ ] `/download` bisa dibuka tanpa login.
- [ ] Data cocok menampilkan sertifikat terbaru dengan dua tombol unduh yang berfungsi.
- [ ] Data tidak cocok menampilkan pesan umum; 429 menampilkan pesan batas percobaan.
- [ ] Nyaman dipakai di HP.
- [ ] Test lolos; `pnpm check` dan `pnpm format:check` lolos.

## Cara verifikasi

```bash
pnpm --filter @karate/web check
pnpm check && pnpm format:check
```
