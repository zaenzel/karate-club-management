# TKT-023: Hapus contoh products dan E2E alur utama

| Field           | Nilai                     |
| --------------- | ------------------------- |
| Area            | web / docs                |
| Prioritas       | P1                        |
| Ukuran          | M                         |
| Status          | Todo                      |
| Bergantung pada | TKT-015, TKT-020, TKT-022 |
| Membuka         | -                         |
| Asumsi terkait  | -                         |

## Konteks

Fitur `products`, mock API `src/app/api/products`, dan `src/mocks/` sengaja dibiarkan dari
template sebagai referensi pola. Setelah fitur asli (cabang, member, ujian, sertifikat) menjadi
referensi yang lebih baik, contoh itu harus dihapus supaya tidak membingungkan dan tidak
bertabrakan dengan rewrites `/api`.

## Tujuan

Repo bersih dari contoh template, dokumentasi web menunjuk ke fitur asli, dan ada E2E yang
menjaga alur utama fase 1.

## Scope

### Termasuk

- Hapus `src/features/products`, `src/app/(dashboard)/products`, `src/app/api/products`,
  `src/mocks/`, `e2e/products.spec.ts`, menu Produk.
- Perbarui `apps/web/AGENTS.md`, `apps/web/docs/*`, dan skill `.claude/skills/new-feature` agar
  contoh referensi menjadi fitur `branches` (atau `members`).
- E2E Playwright alur utama.

### Tidak termasuk

- Fitur baru.
- Mengubah perilaku fitur yang sudah ada (kecuali bug yang ditemukan E2E; catat dan perbaiki
  seperlunya dengan commit `fix`).

## Bacaan wajib

- `apps/web/AGENTS.md` (bagian "Sambungkan ke backend asli"), `playwright.config.ts`,
  `e2e/products.spec.ts` (contoh gaya), semua tiket web sebelumnya.

## Langkah-langkah

1. Cari semua rujukan `products`, `Product`, `mocks` di `apps/web` (`grep -ri product apps/web`),
   termasuk dokumen. Hapus kode, lalu perbarui dokumen yang merujuknya.
2. Perbarui contoh di `apps/web/docs/adding-a-feature.md` dan skill `new-feature` agar memakai
   fitur nyata (`branches`). Pastikan semua path di dokumen benar-benar ada.
3. Ubah komentar default `NEXT_PUBLIC_API_URL` di `src/config/env.ts` (tidak lagi "mock API").
4. **E2E** (Playwright, butuh api + database berjalan): siapkan cara menjalankan dengan data
   terisolasi (database test terpisah lewat env, seed admin + sabuk), lalu tulis:
   - `auth.spec.ts`: halaman dashboard tanpa login diarahkan ke `/login`; login sukses; logout.
   - `exam-flow.spec.ts`: buat cabang → buat 2 member → buat ujian KYU + penguji → tambah peserta
     → mulai → isi hasil (satu lulus, satu tidak) → tutup → riwayat tingkatan member lulus
     berubah.
   - `public-download.spec.ts`: data salah menampilkan pesan umum. (Jalur sukses hanya bila
     TKT-019 sudah selesai; jika belum, tandai `test.skip` dengan alasan yang jelas.)
5. Dokumentasikan cara menjalankan E2E di `apps/web/README.md` (prasyarat, env, perintah).
6. Putuskan bersama user apakah E2E masuk CI (butuh service Postgres di GitHub Actions). Jika ya,
   tambahkan job terpisah `e2e` di `ci.yml`; jika tidak, catat sebagai langkah manual sebelum rilis.

## Jangan lakukan

- Jangan menghapus komponen shared (`components/ui`, `components/common`) yang masih dipakai fitur
  asli.
- Jangan menjalankan E2E terhadap database development yang berisi data sungguhan.
- Jangan memakai selector class/test id bila ada role/label.

## Best practice

- Hapus dalam commit terpisah dari penambahan E2E (`refactor(web): hapus contoh products`,
  `test(web): tambah e2e alur ujian`).
- E2E membuat data unik per run (sufiks waktu) agar bisa dijalankan berulang.

## Kriteria selesai

- [ ] Tidak ada lagi rujukan `products`/`mocks` di kode maupun dokumen web.
- [ ] Dokumen dan skill menunjuk ke fitur nyata yang ada.
- [ ] E2E auth dan alur ujian lolos secara lokal; cara menjalankannya terdokumentasi.
- [ ] `pnpm check` dan `pnpm format:check` lolos.

## Cara verifikasi

```bash
grep -ri "product" apps/web/src apps/web/docs apps/web/AGENTS.md .claude || echo "bersih"
pnpm --filter @karate/web test:e2e
pnpm check && pnpm format:check
```
