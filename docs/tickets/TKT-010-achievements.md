# TKT-010: Prestasi member (api + web)

| Field           | Nilai     |
| --------------- | --------- |
| Area            | api / web |
| Prioritas       | P1        |
| Ukuran          | M         |
| Status          | Todo      |
| Bergantung pada | TKT-009   |
| Membuka         | -         |
| Asumsi terkait  | -         |

## Konteks

Setiap member bisa punya banyak prestasi: kejuaraan, tingkat, kategori, hasil, tanggal. Model
`Achievement` sudah ada: `championship`, `level` (enum `CITY`, `PROVINCE`, `NATIONAL`,
`INTERNATIONAL`, `OTHER`), `category?`, `result`, `date`, `location?`, `attachmentKey?`.

## Tujuan

Admin bisa menambah, mengubah, menghapus, dan melihat prestasi di halaman detail member.

## Scope

### Termasuk

- Api: `GET /api/members/:memberId/achievements`, `POST` di path yang sama,
  `PATCH /api/achievements/:id`, `DELETE /api/achievements/:id`.
- Web: bagian/tab "Prestasi" di halaman detail member (fitur `members`), dengan form tambah/ubah
  dan konfirmasi hapus.

### Tidak termasuk

- Upload lampiran (`attachmentKey`). Biarkan kosong; dibuat terpisah bila user meminta.
- Halaman daftar prestasi lintas member atau laporan.

## Bacaan wajib

- `docs/requirements.md` bagian Member (baris Prestasi), model `Achievement`, pola modul api dari
  TKT-006/008, fitur `members` dari TKT-009.

## Langkah-langkah

1. **Api** `src/achievements/` (module, controller, service, dto, spec):
   - schema: `championship` wajib 2-150, `level` enum (default `OTHER`), `category` opsional,
     `result` wajib (contoh "Juara 1"), `date` `YYYY-MM-DD` tidak di masa depan, `location`
     opsional.
   - create memastikan member ada (404). List urut `date` menurun, tanpa pagination (jumlah per
     member kecil).
   - audit create/update/delete.
   - test service: create untuk member tidak ada (404), list terurut, update dan delete.
2. **Web** di `features/members`:
   - `types/achievement.ts` + label tingkat (`CITY: 'Kota/Kabupaten'`, `PROVINCE: 'Provinsi'`,
     `NATIONAL: 'Nasional'`, `INTERNATIONAL: 'Internasional'`, `OTHER: 'Lainnya'`).
   - api files satu per operasi, query key di bawah key detail member
     (`memberKeys.achievements(memberId)`).
   - schema + test, `achievement-list.tsx` (dumb, + test), `achievement-form.tsx` (dumb),
     `member-achievements-container.tsx`.
   - Tampilkan di halaman detail member di bawah riwayat tingkatan.

## Jangan lakukan

- Jangan membuat fitur web `achievements` terpisah yang di-import oleh `members` (larangan import
  antar fitur). Tetap di dalam fitur `members`.
- Jangan menambah upload file di tiket ini.
- Jangan mengubah enum `AchievementLevel` di skema.

## Best practice

- Form yang sama untuk tambah dan ubah (props `defaultValues`).
- Setelah mutation, invalidate key prestasi member terkait saja.

## Kriteria selesai

- [ ] Prestasi bisa ditambah, diubah, dihapus dari detail member dan langsung ter-update.
- [ ] Validasi tanggal masa depan dan field wajib berjalan di web dan api.
- [ ] Test api dan web lolos; `pnpm check` dan `pnpm format:check` lolos.

## Cara verifikasi

```bash
pnpm --filter @karate/api check
pnpm --filter @karate/web check
pnpm check && pnpm format:check
```
