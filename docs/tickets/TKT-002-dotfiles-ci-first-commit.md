# TKT-002: Dotfiles, CI GitHub Actions, dan commit awal

| Field           | Nilai            |
| --------------- | ---------------- |
| Area            | infra            |
| Prioritas       | P0               |
| Ukuran          | S                |
| Status          | Review           |
| Bergantung pada | TKT-001          |
| Membuka         | semua tiket lain |
| Asumsi terkait  | -                |

## Konteks

Enam file konfigurasi tertahan saat setup awal dan sekarang ada di folder sementara
`dotfiles-karate-club/` di root:

```
dotfiles-karate-club/
├── .claude/skills/new-feature/SKILL.md   skill Claude Code untuk fitur web baru
├── .github/workflows/ci.yml              CI: install, generate, lint, format, typecheck, test, build
├── .husky/commit-msg                     commitlint
├── .husky/pre-commit                     lint-staged
└── .vscode/{settings,extensions}.json    pengaturan editor
```

Repo sudah `git init -b main` tetapi belum punya commit sama sekali.

## Tujuan

Dotfiles berada di tempat yang benar, hook husky aktif, commit pertama dibuat, dan CI di GitHub
berjalan hijau.

## Scope

### Termasuk

- Memindahkan isi `dotfiles-karate-club/` ke root, lalu menghapus folder sementara itu.
- Memastikan hook `commit-msg` dan `pre-commit` jalan.
- Commit awal dan (jika user sudah menyiapkan repo GitHub) push serta cek CI.

### Tidak termasuk

- Mengubah isi `ci.yml` selain perbaikan yang dibutuhkan supaya hijau.
- Menambah job deploy, release, atau Dependabot.

## Bacaan wajib

- `AGENTS.md` (aturan commit), `commitlint.config.mjs`, `package.json` root (lint-staged),
  isi tiap file di `dotfiles-karate-club/`.

## Langkah-langkah

1. Baca setiap file di `dotfiles-karate-club/` sebelum memindahkan.
2. Pindahkan dengan mempertahankan struktur:
   `cp -r dotfiles-karate-club/.claude dotfiles-karate-club/.github dotfiles-karate-club/.vscode .`
   lalu salin `dotfiles-karate-club/.husky/commit-msg` dan `pre-commit` ke `.husky/` (folder
   `.husky/_` sudah ada, jangan dihapus).
3. Pastikan kedua hook bisa dieksekusi: `chmod +x .husky/commit-msg .husky/pre-commit`.
4. Hapus `dotfiles-karate-club/` setelah yakin semua file sudah tersalin (`git status` menunjukkan
   file baru di `.claude`, `.github`, `.husky`, `.vscode`).
5. Jalankan `pnpm install` sekali lagi supaya `prepare` (husky) memasang hook.
6. Pastikan `.env` dan `packages/db/src/generated` **tidak** muncul di `git status` (sudah di
   `.gitignore`). Folder `packages/db/prisma/migrations` **harus** muncul.
7. `pnpm check` dan `pnpm format:check` lolos.
8. `git add -A` lalu commit dengan pesan Conventional Commits, contoh
   `chore: setup awal monorepo karate club management`. Hook harus berjalan. Uji juga bahwa pesan
   tidak valid (`git commit --allow-empty -m "asal"`) ditolak commitlint.
9. Jika user sudah memberi URL repo GitHub: `git remote add origin <url>` lalu
   `git push -u origin main`. Jangan membuat repo GitHub atas nama user tanpa diminta.
10. Buka tab Actions di GitHub, pastikan workflow **CI** hijau. Jika merah, perbaiki penyebabnya
    (biasanya env atau urutan `db:generate`), commit perbaikan, push lagi.

## Jangan lakukan

- Jangan memakai `git commit --no-verify` untuk melewati hook.
- Jangan commit `.env`, file generate Prisma, atau file sertifikat/tanda tangan asli.
- Jangan force-push ke `main`.
- Jangan menambahkan secret apa pun ke workflow. CI tidak butuh database sungguhan.

## Best practice

- Periksa `git status` dan `git diff --cached --stat` sebelum commit pertama: ini commit yang akan
  dibaca semua orang.
- Simpan perbaikan CI sebagai commit terpisah `ci: ...` agar mudah ditelusuri.

## Kriteria selesai

- [x] `.claude/skills/new-feature/SKILL.md`, `.github/workflows/ci.yml`, `.husky/commit-msg`,
      `.husky/pre-commit`, `.vscode/settings.json`, `.vscode/extensions.json` ada di root.
- [x] Folder `dotfiles-karate-club/` sudah tidak ada.
- [x] Commit dengan pesan tidak valid ditolak; commit valid lolos dan menjalankan lint-staged.
- [x] Commit awal berisi migrasi `init`, tanpa `.env` dan tanpa file generate.
- [ ] (Jika remote ada) workflow CI hijau di `main`.

## Cara verifikasi

```bash
git log --oneline
git ls-files | grep -E '^\.env$|generated' || echo "aman"
git ls-files packages/db/prisma/migrations
pnpm check && pnpm format:check
```

## Catatan

- Jika user belum punya repo GitHub, tiket dianggap selesai setelah langkah 8; tandai langkah 9
  dan 10 sebagai menunggu user di PR/catatan.
