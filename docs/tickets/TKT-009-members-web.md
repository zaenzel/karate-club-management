# TKT-009: Fitur member (web)

| Field           | Nilai            |
| --------------- | ---------------- |
| Area            | web              |
| Prioritas       | P0               |
| Ukuran          | L                |
| Status          | Todo             |
| Bergantung pada | TKT-007, TKT-008 |
| Membuka         | TKT-010, TKT-015 |
| Asumsi terkait  | A1, A2, A3, A4   |

## Konteks

Admin memasukkan member baru dan data lama secara manual, termasuk tingkatan awal untuk member
lama. Setelah dibuat, tingkatan hanya berubah lewat ujian, jadi form edit tidak menampilkan field
sabuk/kyu/dan.

## Tujuan

Admin bisa mencari dan memfilter member, menambah member (dengan tingkatan awal opsional),
mengubah data diri, menghapus member yang belum pernah ikut ujian, dan melihat detail + riwayat
tingkatan.

## Scope

### Termasuk

- Fitur `src/features/members`.
- Halaman `/members`, `/members/new`, `/members/[id]`, `/members/[id]/edit`.
- Dropdown cabang dan sabuk lewat fungsi API milik fitur member sendiri.
- Melengkapi form cabang (TKT-007) dengan dropdown kepala cabang (coach) bila belum ada.

### Tidak termasuk

- Tab prestasi di detail member (TKT-010), cukup sediakan tempatnya.
- Mengubah tingkatan lewat UI.

## Bacaan wajib

- `apps/web/AGENTS.md`, `apps/web/docs/adding-a-feature.md`, fitur `branches` hasil TKT-007 (pola
  yang sudah disetujui), kontrak api TKT-008, README tiket Asumsi A2 sampai A4.

## Langkah-langkah

1. `types/member.ts`: `Member`, `MemberType` (`COACH`/`STUDENT`), `GradeHistoryItem`,
   `MemberListParams`, dan label Indonesia (`MEMBER_TYPE_LABELS = { COACH: 'Coach', STUDENT:
'Murid' }`).
2. `api/`: `query-keys.ts`, `get-members.ts`, `get-member.ts`, `create-member.ts`,
   `update-member.ts`, `delete-member.ts`, `get-member-grade-history.ts`,
   `get-branch-options.ts` (memanggil `/branches/options`), `get-belts.ts` (memanggil `/belts`).
   Jangan import dari fitur `branches`.
3. `schemas/member-schema.ts`:
   - create: data diri + `initialGrade` opsional (sabuk, kyu, dan). Aturan UX sama dengan api:
     kyu 0 sampai 10 kelipatan 0.5, hitam hanya bila kyu 0, dan hanya untuk hitam.
   - update: data diri saja.
   - Simpan konstanta kyu di satu file (`types/grade.ts`) agar mudah diganti bila asumsi A2
     berubah.
   - Test tuntas untuk kedua schema.
4. `hooks/use-member-list-params.ts`: `page`, `q`, `branchId`, `type`, `beltId` di URL.
5. Komponen dumb:
   - `member-table.tsx`: No. anggota, Nama, Tipe, Cabang, Sabuk, Kyu/Dan. Warna sabuk ditampilkan
     lewat komponen `BeltBadge` yang memetakan `order` sabuk ke token warna di `globals.css`
     (tambahkan token sabuk bila belum ada). Jangan memakai `colorHex` sebagai inline style.
   - `member-filters.tsx`, `member-form.tsx` (bagian "Tingkatan awal" bisa dibuka-tutup, default
     tertutup dengan keterangan "Kosongkan untuk member baru: sabuk putih, kyu 10"),
     `member-detail.tsx`, `grade-history-list.tsx`.
   - Test: tabel (data, kosong), form (validasi hitam kyu bukan 0 ditolak), riwayat (label
     "Input awal" vs "Ujian <nama>").
6. Containers: list, create, edit, detail. Setelah create sukses, arahkan ke halaman detail dan
   tampilkan nomor anggota yang dibuat sistem.
7. Format tampilan: tanggal lahir `1 Mei 2012` (locale `id-ID`), kyu `9,5` bila desimal, tingkatan
   ringkas "Biru, kyu 5" atau "Hitam, dan 2".
8. Hapus: hanya tampil tombol aktif bila api mengizinkan; jika api membalas 409 tampilkan pesannya.
9. Lengkapi `features/branches`: dropdown "Kepala cabang" berisi member bertipe coach (fungsi API
   sendiri di fitur branches, mis. `get-coach-options.ts` memanggil
   `/members?type=COACH&pageSize=100`).
10. Halaman tipis di `src/app/(dashboard)/members/...`.

## Jangan lakukan

- Jangan menampilkan field sabuk/kyu/dan di form edit.
- Jangan import antar fitur (`members` ↔ `branches`).
- Jangan menghitung warna sabuk otomatis dari kyu (asumsi A1: dipilih manual).
- Jangan menulis hex warna langsung di class komponen.

## Best practice

- Input kyu: `type="number"`, `step="0.5"`, `min=0`, `max=10`, `valueAsNumber`.
- Input tanggal: `type="date"`, kirim apa adanya (`YYYY-MM-DD`), jangan diubah ke `Date` di form.
- Filter dan pencarian mengembalikan `page` ke 1.

## Kriteria selesai

- [ ] Daftar member dengan pencarian dan filter cabang/tipe/sabuk, tersimpan di URL.
- [ ] Tambah member baru (default putih kyu 10) dan member lama (tingkatan awal) berhasil.
- [ ] Detail menampilkan data diri, tingkatan saat ini, dan riwayat tingkatan.
- [ ] Edit tidak bisa mengubah tingkatan; error api tampil.
- [ ] Form cabang punya dropdown kepala cabang (coach).
- [ ] Test lolos; `pnpm check` dan `pnpm format:check` lolos.

## Cara verifikasi

```bash
pnpm --filter @karate/web check
pnpm check && pnpm format:check
```
