# Kebutuhan produk

Sumber kebenaran aturan domain. Berisi keputusan dari klien (16 sampai 17 Oktober 2026). Jika kode
dan dokumen ini berbeda, tanyakan ke user mana yang benar, lalu perbarui dokumen.

## Ruang lingkup fase 1

| Aktor                | Bisa melakukan                                                            |
| -------------------- | ------------------------------------------------------------------------- |
| Super Admin          | Semua: cabang, master sabuk, member, prestasi, ujian, hasil, sertifikat   |
| Publik (tanpa login) | Input nomor anggota + tanggal lahir, lalu unduh sertifikat terbaru member |

Modul: **cabang**, **master sabuk**, **member**, **riwayat tingkatan**, **prestasi**, **ujian
kenaikan tingkat**, **sertifikat**, **download publik**.

### Ditunda ke fase berikutnya (jangan dibuat sekarang)

- Role lain: admin cabang, coach, penguji, member/wali (aktor lain dibuat di fase berikutnya).
- Raport ujian dan komponen nilai (belum ada keputusan cara pengambilan nilai).
- Syarat absensi dan durasi latihan sebagai prasyarat ujian (sengaja tanpa batasan).
- Verifikasi sertifikat lewat QR, portal member, pembayaran online, import data massal.

## Cabang

Klub punya cabang di berbagai kota. Data: kode, nama, kota, alamat (opsional), telepon (opsional),
kepala cabang (opsional, seorang coach).

## Member

Dua tipe: **coach** dan **student**. Keduanya punya data yang sama.

| Data              | Aturan                                                              |
| ----------------- | ------------------------------------------------------------------- |
| Nomor anggota     | Unik, dibuat sistem. Format belum ada. Tanpa NIK                    |
| Nama              | Wajib                                                               |
| Tempat, tgl lahir | Wajib. Tanggal lahir juga dipakai di halaman download publik        |
| Alamat            | Wajib                                                               |
| Cabang asal       | Wajib                                                               |
| Nomor telepon     | Opsional                                                            |
| Sabuk, kyu, dan   | Lihat aturan sabuk. Hanya berubah lewat hasil ujian atau input awal |
| Prestasi          | Banyak per member: kejuaraan, tingkat, kategori, hasil, tanggal     |

Data lama dimasukkan manual oleh user (tidak perlu import). Raport ditunda.

## Sabuk, kyu, dan

- Urutan warna: **putih, kuning, hijau, biru, cokelat, hitam**.
- Kyu dihitung mundur dari **10 sampai 0**. Member baru: **putih, kyu 10**.
- Kyu hanya turun lewat ujian lulus. **Default turun 1 per ujian.** Boleh 0.5, 2, atau lebih
  untuk lulusan terbaik; nilai diisi admin per peserta.
- **Sabuk hitam hanya bisa dicapai setelah kyu 0.**
- Setelah hitam, tingkatan **dan** juga diujikan di sistem (default naik 1 per ujian lulus).
- Saat pertama kali mendapat sabuk hitam, member langsung **dan 1** (dikonfirmasi user 18 Okt 2026).
- Tidak ada rentang kyu per warna. Warna sabuk baru **dipilih admin per peserta** saat hasil
  diinput; defaultnya sama dengan warna sebelumnya.

Asumsi yang perlu dikonfirmasi: nilai kyu berkelipatan 0.5; warna sabuk dipilih manual (bukan
dihitung dari rentang kyu).

Perubahan sabuk/kyu/dan dicatat di riwayat tingkatan (sumber kebenaran). Nilai di data member adalah
cache nilai terakhir.

## Ujian kenaikan tingkat

- Data event: nama, jenis (**ujian kyu** atau **ujian dan**), tanggal, tempat, biaya, penguji.
- Penguji: satu atau lebih, ditulis sebagai nama (bukan akun). Satu bisa ditandai ketua penguji.
- Peserta boleh dari banyak cabang dalam satu event. Tidak ada syarat absensi atau durasi latihan.
- Biaya fleksibel: ada biaya default per ujian, bisa ditimpa per peserta (sama atau berbeda).
  Status bayar per peserta: belum, lunas, dibebaskan.
- Hasil per peserta cukup **lulus** atau **tidak lulus**. Komponen nilai ditunda.
- Status event: draft, berlangsung, selesai. Saat selesai: hasil dikunci, riwayat tingkatan dibuat
  untuk yang lulus, sertifikat masuk antrian render.

## Sertifikat

- Dibuat otomatis untuk peserta yang lulus, setelah ujian selesai.
- Nomor sertifikat: `C` + tahun + 5 digit urut per tahun, tanpa tanda hubung (contoh `C202600001`).
  Nomor anggota: `M` + tahun + 5 digit (contoh `M202600001`). Dikonfirmasi user 18 Okt 2026.
- Desain: **PDF A4 lanskap** (842 × 595 pt), satu desain untuk semua jenis ujian (kyu dan dan).
  File desain "IJAZAH Karate Kids Academy" sudah diterima 18 Okt 2026 (jangan di-commit ke repo).
  Isian dinamis di desain: Nama, Tempat/tanggal lahir, Cabang, Ranting, tanggal tes, tempat tes,
  sabuk. Nama ketua (Yudi Fatkhurohman, Karate DAN III) dan tanda tangan sudah ada di desain.
- Ditandatangani **ketua club saja** (nama ketua + gambar tanda tangan disimpan di template).
- Diunduh sebagai **PDF** (vektor) dan **PNG** (300 DPI) tanpa penurunan kualitas.
- Dirender sekali lalu disimpan sebagai file; unduhan mengambil file yang sama.
- Penerbitan ulang membuat sertifikat baru dan menonaktifkan yang lama. Satu sertifikat aktif per
  peserta ujian.

## Download publik

- Halaman tanpa login: input **nomor anggota + tanggal lahir**.
- Cocok: tampilkan **sertifikat terbaru** member (hanya yang terbaru) dengan tombol PDF dan PNG.
- Tidak cocok: pesan umum yang sama, tidak membedakan nomor salah atau tanggal salah.
- Rate limit per IP. Tidak menampilkan profil member, hanya sertifikat.

## Pertanyaan terbuka

- [x] File desain sertifikat (diterima 18 Okt; font di PDF berupa outline Type 3, tidak perlu file font untuk teks tetap; teks dinamis butuh font pilihan yang cocok).
- [x] Nama ketua club dan tanda tangan (sudah ada di dalam desain).
- [x] Format nomor anggota dan sertifikat (`M202600001`, `C202600001`).
- [x] (default disetujui user 18 Okt) Isian "Ranting", teks tetap "Depok, 31 Maret 2026", dan teks sabuk (README tiket A12 sampai A14).
- [ ] Konfirmasi dua asumsi di bagian sabuk (kelipatan 0.5, warna dipilih manual).
