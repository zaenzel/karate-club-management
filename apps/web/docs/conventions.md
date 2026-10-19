# Konvensi kode

## TypeScript

- `strict` + `noUncheckedIndexedAccess` aktif. Tanpa `any`, tanpa `@ts-ignore`, tanpa non-null
  assertion (`!`) kecuali alasannya jelas dan dikomentari.
- Gunakan `type` untuk bentuk data; `interface` hanya bila perlu di-extend.
- Turunkan tipe dari sumbernya: `z.infer<typeof schema>`, `(typeof ARR)[number]`.
- Import tipe dengan `import type` atau `import { type X }` (dijaga ESLint).

## Komponen

- Named export, satu komponen utama per file. Sub-komponen kecil boleh di file yang sama.
- Props didefinisikan sebagai `type XxxProps` tepat di atas komponen.
- Terima `className` jika komponen kemungkinan perlu diatur dari luar; gabungkan dengan `cn()`.
- Kondisional render: `cond ? <X /> : null`, hindari `cond && <X />` untuk nilai angka.
- Urutan render di komponen data: loading → error → kosong → data.

## Urutan import

1. Paket eksternal (`react`, `next/*`, library)
2. Alias internal (`@/components`, `@/lib`, `@/features/x`)
3. Relatif (`../`, `./`)

Pisahkan tiap grup dengan baris kosong.

## Styling

- Tailwind utility class. Warna **hanya** lewat token (`bg-primary`, `text-muted-foreground`),
  tidak ada hex/rgb hardcode di komponen.
- Token warna diatur di `src/styles/globals.css` (light & dark).
- Varian komponen pakai `cva` (lihat `components/ui/button.tsx`).
- Prettier mengurutkan class Tailwind otomatis.

## Data fetching

- Satu operasi per file di `features/<fitur>/api/`: fungsi murni + hook-nya.
- Fungsi murni (`getX`, `createX`) mengembalikan data yang sudah di-unwrap (`data`, bukan
  `AxiosResponse`).
- Query key selalu dari `query-keys.ts`. Mutation meng-invalidate key yang terdampak.
- Jangan memanggil `refetch()` setelah mutation — gunakan invalidasi.

## Form

- React Hook Form + `zodResolver(schema)`.
- Input angka: `register('price', { valueAsNumber: true })` dan schema `z.number()`.
- Pesan validasi dalam Bahasa Indonesia, ditulis di schema.
- Komponen form tidak tahu soal API: terima `onSubmit`, `isSubmitting`, `submitError` lewat props
  sehingga bisa dipakai untuk create maupun edit.
- Tandai field error dengan `aria-invalid` dan hubungkan label lewat `htmlFor`.

## Aksesibilitas

- Elemen interaktif harus elemen semantik (`button`, `a`, `input`), bukan `div` dengan `onClick`.
- Input tanpa label terlihat wajib punya `aria-label`.
- Pesan error penting memakai `role="alert"`.

## Testing

| Jenis    | Alat                     | Yang dites                                    |
| -------- | ------------------------ | --------------------------------------------- |
| Unit     | Vitest                   | schema Zod, util, hook murni                  |
| Komponen | Vitest + Testing Library | komponen dumb: render sesuai props, interaksi |
| E2E      | Playwright (`e2e/`)      | alur utama user (buat data, lihat hasil)      |

- Query elemen dengan role/label/text yang dilihat user (`getByRole`, `getByLabelText`), bukan
  class atau test id, kecuali tidak ada alternatif.
- Komponen smart lebih baik dites lewat E2E daripada mock bertingkat.

## Git

- Conventional Commits, dijaga `commitlint`: `feat(products): tambah filter kategori`.
  Tipe: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `style`, `perf`, `ci`, `build`.
- `pre-commit` menjalankan ESLint + Prettier pada file yang di-stage.
- Nama branch: `feat/<ringkas>`, `fix/<ringkas>`.
