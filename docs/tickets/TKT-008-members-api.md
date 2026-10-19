# TKT-008: Modul member dan riwayat tingkatan (api)

| Field           | Nilai                     |
| --------------- | ------------------------- |
| Area            | api                       |
| Prioritas       | P0                        |
| Ukuran          | L                         |
| Status          | Todo                      |
| Bergantung pada | TKT-006                   |
| Membuka         | TKT-009, TKT-010, TKT-012 |
| Asumsi terkait  | A2, A3, A4, A10           |

## Konteks

Member ada dua tipe: **coach** dan **student**, datanya sama. Nomor anggota **dibuat sistem**,
unik, dan menjadi kunci halaman download publik bersama tanggal lahir. Sabuk/kyu/dan member
**hanya berubah lewat hasil ujian atau input awal**. Riwayat tingkatan (`GradeHistory`) adalah
sumber kebenaran; `members.beltId/kyu/dan` hanya cache nilai terakhir.

Karena data lama diinput manual, admin harus bisa mengisi **tingkatan awal** saat membuat member
(misal member lama yang sudah sabuk biru kyu 5). Itu dicatat sebagai `GradeHistory` dengan
`source = INITIAL`.

## Tujuan

CRUD member dengan nomor anggota otomatis, input tingkatan awal yang tervalidasi, dan endpoint
riwayat tingkatan.

## Scope

### Termasuk

- `GET /api/members` (pagination; filter `branchId`, `type`, `beltId`; cari `q` di nama atau nomor
  anggota; urut nama).
- `GET /api/members/:id` (detail + cabang + sabuk).
- `POST /api/members` (data diri + tingkatan awal opsional).
- `PATCH /api/members/:id` (data diri saja, **tanpa** sabuk/kyu/dan).
- `DELETE /api/members/:id` (hanya bila belum pernah ikut ujian dan belum punya sertifikat).
- `GET /api/members/:id/grade-history`.
- `GET /api/belts` (daftar 6 sabuk urut `order`, untuk dropdown).
- Generator nomor anggota.

### Tidak termasuk

- Prestasi (TKT-010).
- Mengubah tingkatan setelah member dibuat (hanya lewat ujian, TKT-013).
- Field tambahan seperti gender, foto, wali (asumsi A3).
- Import massal.

## Bacaan wajib

- `docs/requirements.md` bagian Member dan Sabuk, kyu, dan.
- Model `Member`, `Belt`, `GradeHistory` di skema.
- README tiket: Asumsi A2, A3, A4, A10 dan Kontrak HTTP.

## Langkah-langkah

1. **Aturan tingkatan murni** di `src/members/grade-rules.ts` (akan dipakai lagi oleh modul ujian;
   jika lebih cocok, taruh di `src/grades/grade-rules.ts` dan export dari sana):
   - `KYU_MIN = 0`, `KYU_MAX = 10`, `KYU_STEP = 0.5` (asumsi A2, satu tempat).
   - `isValidKyu(kyu)`: di rentang 0 sampai 10 dan kelipatan 0.5.
   - `validateGrade({ beltOrder, kyu, dan, blackOrder })`: sabuk hitam hanya bila `kyu === 0`;
     sabuk hitam **wajib** punya `dan` bilangan bulat ≥ 1 (A4); selain hitam `dan` harus `null`.
   - Kembalikan daftar pesan error berbahasa Indonesia, jangan melempar exception dari fungsi
     murni.
   - Test tuntas: kyu 10, 9.5, 0 valid; 10.5, -0.5, 9.3 tidak valid; hitam kyu 1 ditolak; hitam
     kyu 0 dan 1 valid; hitam kyu 0 dan 2 valid; hitam tanpa dan ditolak (A4); biru dengan dan ditolak.
2. **Nomor anggota** di `src/members/member-number.ts`: format `MYYYYNNNNN`, contoh `M202600001` (tahun saat
   dibuat, urut per tahun, 5 digit, tanpa tanda hubung; A10 sudah dikonfirmasi). Ambil nomor terakhir tahun itu dan tambah 1 di
   dalam transaksi yang sama dengan insert. Tangani bentrok konkuren: bila insert gagal karena
   unique (`P2002` pada `member_number`), ulangi maksimal 3 kali. Format di satu fungsi agar mudah
   diganti. Test: nomor pertama tahun itu, lanjutan, pergantian tahun.
3. **DTO Zod** (`dto/`):
   - `type`: `COACH` | `STUDENT`. `name` 2-100, `birthPlace` wajib, `birthDate` string
     `YYYY-MM-DD` valid dan tidak di masa depan, `address` wajib, `phone` opsional, `branchId`
     uuid.
   - `initialGrade` opsional: `{ beltId, kyu, dan? }`. Jika tidak diisi: sabuk urutan 1 (putih),
     kyu 10, dan `null`. Jika sabuk hitam dipilih tetapi `dan` tidak diisi, pakai `1` (A4).
4. **Service create** (dalam satu `$transaction`):
   - pastikan cabang ada (404 jika tidak);
   - tentukan tingkatan awal, validasi dengan `validateGrade` (409 + daftar pesan bila gagal);
   - buat nomor anggota, insert `Member` dengan cache sabuk/kyu/dan;
   - insert `GradeHistory` `source: INITIAL`, `fromBeltId/fromKyu/fromDan = null`,
     `toBeltId/toKyu/toDan` = tingkatan awal;
   - audit `member.create`.
5. **Service update**: hanya field data diri dan cabang. Jika body berisi `beltId`, `kyu`, atau
   `dan`, tolak 400 (schema update tidak boleh menerima field itu; gunakan `.strict()`).
6. **Service delete**: tolak 409 bila member punya `examParticipants` atau `certificates`, atau
   menjadi kepala cabang. Jika boleh, hapus (riwayat INITIAL dan prestasi ikut terhapus cascade).
7. **List/detail**: respons
   `{ id, memberNumber, type, name, birthPlace, birthDate (YYYY-MM-DD), address, phone,
branch: { id, code, name }, belt: { id, name, order, colorHex }, kyu (number), dan,
createdAt, updatedAt }`.
8. **Grade history**: urut `occurredAt` menurun; tiap item berisi `source`, sabuk dari/ke (nama),
   kyu dari/ke (number), dan dari/ke, `occurredAt`, dan info ujian bila `source = EXAM`
   (`exam: { id, name, date }`).
9. **Belts**: `src/belts/` kecil dengan `GET /api/belts`.
10. **Kepala cabang**: tambahkan test integrasi tipis di modul cabang bahwa member COACH kini bisa
    dipilih (melengkapi TKT-006).
11. **Test service** dengan Prisma tiruan: create default putih/10, create dengan tingkatan awal
    valid, ditolak (hitam kyu 2), update menolak field kyu, delete ditolak saat sudah ikut ujian.

## Jangan lakukan

- Jangan menyediakan endpoint untuk mengubah sabuk/kyu/dan langsung.
- Jangan menyimpan kyu sebagai float JavaScript ke database tanpa melewati `Prisma.Decimal`; jangan
  membandingkan Decimal dengan `===`.
- Jangan menebak rentang kyu per warna (tidak ada aturannya).
- Jangan membuat NIK atau field identitas lain.
- Jangan membiarkan tanggal lahir bergeser hari karena zona waktu (simpan sebagai tanggal UTC
  tengah malam, kirim balik `YYYY-MM-DD`).

## Best practice

- Konversi kyu: terima `number` di DTO, ubah ke `new Prisma.Decimal(kyu)` di service, kirim balik
  dengan `toNumber()` dari TKT-003.
- Cari sabuk putih/hitam berdasarkan `order` (1 dan 6), bukan nama, dan cache hasilnya per request.
- Semua tulisan ke `members` + `grade_histories` di transaksi yang sama.

## Kriteria selesai

- [ ] Member baru tanpa tingkatan awal tersimpan putih, kyu 10, dengan satu riwayat INITIAL.
- [ ] Nomor anggota otomatis, unik, berformat `MYYYYNNNNN` (contoh `M202600001`).
- [ ] Tingkatan awal tidak valid ditolak dengan pesan jelas.
- [ ] Update tidak bisa mengubah tingkatan; delete tertolak bila sudah ikut ujian.
- [ ] `grade-rules.ts` dan `member-number.ts` punya test tuntas.
- [ ] `pnpm check` dan `pnpm format:check` lolos.

## Cara verifikasi

```bash
pnpm --filter @karate/api check
curl -b /tmp/c.txt -H 'Content-Type: application/json' -d '{
  "type":"STUDENT","name":"Budi","birthPlace":"Bandung","birthDate":"2012-05-01",
  "address":"Jl. Contoh 1","branchId":"<id cabang>"}' http://localhost:4000/api/members
curl -b /tmp/c.txt http://localhost:4000/api/members/<id>/grade-history
pnpm check && pnpm format:check
```

## Catatan

- Jika user menetapkan format nomor anggota berbeda dari usulan, cukup ubah
  `member-number.ts` dan test-nya. Member yang sudah dibuat tidak diubah nomornya.
