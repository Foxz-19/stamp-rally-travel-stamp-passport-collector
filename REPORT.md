# Hasil implementasi dan evaluasi Stamp Rally

Tanggal: 7 September 2026. Ini penilaian mandiri berbasis implementasi dan bukti pengujian, bukan hasil juri resmi.

## Hasil

SPA paspor pribadi selesai, dengan tambah/edit/hapus, status visited/dream, pemilih tanggal, lima tinta, memori plain text, cap CSS berinisial dengan kemiringan acak yang disimpan, grid responsif, ringkasan, localStorage, pencarian/filter, dan backup–restore.

`prompt.md` dan `brief.txt` dibaca seluruhnya dan tidak diubah. Aturan, rubrik, serta 34 pernyataan negatif dipetakan berurutan dalam REQUIREMENTS.md sebagai memori proyek yang dapat dibaca ulang. Contoh negatif tentang cocktail/hadiah/episode diterapkan ke masalah paspor yang setara; produk tidak ditambahi fitur dari aplikasi lain.

## Scoring results

| Kategori | Skala prompt | Skala brief | Alasan |
|---|---:|---:|---|
| Completeness | 5/5 | 95/100 | Semua fitur inti reachable. CRUD, dua status, tanggal, warna, memori, ringkasan, refresh, konfirmasi, serta kegagalan storage diuji. Backup/restore melindungi data tanpa backend. |
| Problem Solving & Design | 4/5 | 91/100 | Metafora paspor konsisten, tidak mengarang riwayat pengguna, empty state jelas, tanggal diminta ketika mimpi dikunjungi, error tidak hanya toast. Mobile tidak overflow; audit axe akhir bersih. Belum ada pengujian kegunaan dengan pengguna nyata; composer cukup panjang di ponsel. |
| Technical Craft | 4/5 | 90/100 | Modul ES terpisah, kontrak JSDoc diperiksa TypeScript strict, schema runtime, escaping, pengujian otomatis, ukuran digate. CSS dan beberapa event handler masih padat; cakupan browser hanya Chromium dan tes interaksi belum menjadi suite CI. |
| Rata-rata sederhana | 4,33/5 | 92/100 | Rata-rata informatif, bukan formula resmi juri atau konversi linear antara kedua rubrik. |

Tidak ada penalti ukuran: raw source **39.954 byte / 40.000 byte**, sisa **46 byte**, sekitar 39,02 KiB. Tidak ada commit baru dibuat; perubahan berada di working tree, sehingga kualitas struktur commit submission belum dapat dinilai. Riwayat awal berisi proyek kalkulator akuarium; beberapa file lama sudah dihapus sebelum pekerjaan ini dimulai dan tidak dipulihkan.

## Inventaris ukuran

| File | Byte |
|---|---:|
| index.html | 5.417 |
| styles.css | 9.788 |
| js/main.js | 10.055 |
| js/model.js | 3.844 |
| js/storage.js | 1.784 |
| js/view.js | 3.499 |
| test/app.test.mjs | 3.187 |
| scripts/serve.mjs | 917 |
| scripts/size.mjs | 848 |
| jsconfig.json | 208 |
| package.json | 276 |
| .gitignore + .ompgnore | 131 |
| **Total** | **39.954** |

Penghitungan memasukkan aplikasi, tes, tooling dan konfigurasi. Markdown/txt dikecualikan sesuai prompt; tidak ada aset gambar runtime. `.git`, dependencies hasil install, output build/coverage, artefak screenshot dan metadata tool bukan source submission. Direktori hasil tersebut tidak diperlukan untuk menjalankan source. Jalankan `npm run check` kembali sebelum submission; jangan memasukkan node_modules ke arsip/repo.

## Verifikasi yang dijalankan

- `npm test`: **7/7 kelompok tes lulus**, mencakup tanggal kabisat/invalid/future, field kosong/batas panjang/status/warna, edit mempertahankan ID/tilt, Unicode, ringkasan/filter, schema/duplikasi ID, corrupt/blocked reads, quota/concurrent writes, escaping HTML dan rendering state.
- `npm run check`: **lulus**, TypeScript strict checkJs untuk semua modul aplikasi dan size gate 40.000 byte.
- Chromium melalui agent-browser: tambah visited, edit memori, visited → dream → visited dengan tanggal yang dipilih, pencarian kosong/reset, filter dengan ringkasan global, dream tanpa tanggal dan empat kartu berwarna.
- Klik nyata Delete lalu Escape: dialog tertutup, kartu tetap ada, fokus kembali ke tombol Delete. Confirm Delete menghapus satu kartu dan memindahkan fokus ke collection.
- Penyuntikan quota failure: pesan inline dan peringatan persisten terlihat, form tidak terhapus, koleksi sebelumnya tetap utuh. Pemulihan dengan Retry berhasil.
- Penyuntikan denied storage read: pesan terlihat; setelah akses dipulihkan Retry berhasil.
- Payload localStorage rusak + reload: peringatan terlihat, raw original tetap identik, tidak reseed. Mengembalikan data valid lalu Retry memulihkan empat kartu.
- Import invalid tidak mengganti koleksi; restore cancel mempertahankan data; restore kosong dan restore empat kartu berhasil sesudah konfirmasi. Export memicu permintaan download; keberhasilan penyimpanan file oleh OS tidak diklaim terverifikasi.
- Viewport desktop 1440 × 1000 dan mobile 390 × 844. Mobile `scrollWidth === innerWidth === 390`. Screenshot desktop/mobile diperiksa; screenshot full-page dapat menangkap elemen fixed pada offset scroll, sehingga posisi skip link diperiksa langsung: berada di luar layar sebelum fokus.
- Axe 4.12.1 setelah perbaikan: **0 violations, 0 incomplete, 40 passes**, desktop dan mobile berisi kartu nyata.
- Emulasi prefers-reduced-motion: diperiksa pada computed style; animasi kartu menjadi none dan scroll behavior auto.

Audit otomatis bukan sertifikasi aksesibilitas. Belum diuji secara langsung dengan screen reader, Safari, Firefox, perangkat iOS/Android fisik, atau pengguna nyata. Detector desain lokal berjalan dalam mode degraded karena parser opsional tidak tersedia dan workflow visual comp tidak diselesaikan; hasil kosongnya tidak dipakai sebagai bukti kualitas. Bukti utama adalah pemeriksaan browser, axe dan tes kode.

## Daftar fix dan debugging

1. **Repo awal kosong secara implementasi:** membangun modul paspor baru tanpa mengembalikan file kalkulator yang sebelumnya dihapus pengguna.
2. **Kontrak data implisit:** menetapkan Stamp/Draft/Ink/Status, strict checkJs, validasi schema import dan storage.
3. **Tanggal rollover dan future:** memvalidasi tanggal kalender secara nyata, menolak kunjungan masa depan, mengizinkan mimpi tanpa tanggal, menggunakan tanggal lokal agar tidak bergeser karena UTC.
4. **Storage gagal diam-diam:** menambah banner persisten, retry, original-data download, dan error inline pada form. Save bersifat commit-after-success.
5. **Data rusak dan kehilangan data:** tidak reseed/overwrite otomatis; restore valid memerlukan konfirmasi. Perubahan dari tab lain terdeteksi sebelum write.
6. **Hapus ambigu:** dialog menyebut nama tempat dan satu entry yang dihapus. Cancel/Escape dan fokus diuji.
7. **Tes pencarian salah:** fixture pertama mewariskan memori yang sama ke dua tempat; ekspektasi satu hasil tidak benar. Fixture diperbaiki dengan memori berbeda, fungsi pencarian tidak dilemahkan.
8. **TypeScript mendeteksi nullable DOM:** menangani elemen view secara eksplisit dan menggunakan helper DOM yang diperiksa pada controller.
9. **Refactor helper sempat shadowed:** parameter `text` bertabrakan dengan fungsi `text`; strict check menemukan masalah sebelum selesai. Parameter diganti `message`, check dan tes diulang.
10. **Ukuran awal 44.906 byte:** menghapus CSS berulang/dekorasi sekunder, menyederhanakan breakpoint, memadatkan tes tetap dengan assertion inti, dan menyatukan penulisan teks DOM. Source akhir 39.954 byte, bukan ukuran zip.
11. **Kontras teks sekunder 4,31:1:** token muted digelapkan, melewati audit ulang.
12. **Label intro tidak valid:** h1 diberi ID yang cocok dengan aria-labelledby.
13. **Cap mimpi terlalu pudar:** opacity seluruh cap menyebabkan teks gagal kontras. Pudar diterapkan ke ring yang dashed, sementara inisial tetap terbaca; audit ulang bersih.
14. **Judul mobile menyatu:** aturan penyembunyian line break dihapus sehingga “Places go.” dan “Memories stay.” terpisah benar.
15. **Tes fokus sintetis menyesatkan:** DOM `.click()` tidak memfokuskan tombol seperti klik nyata. Tes diulangi dengan klik browser + Escape; fokus kembali benar. Tidak mengubah kode yang sudah berperilaku benar berdasarkan fixture yang keliru.
16. **Dokumentasi diabaikan Git:** pola `*.md`/`*.txt` di .gitignore dihapus supaya dokumen laporan dapat masuk submission. Pengecualian lokal untuk dua dokumen sumber asli tetap dipertahankan.

## Rekomendasi untuk memaksimalkan kualitas di 40 KB

Sisa 46 byte bukan ruang realistis untuk fitur baru. Pertahankan batas melalui pertukaran anggaran; jangan menghapus validasi, schema, persistent error atau tes untuk dekorasi. Estimasi di bawah bukan hasil pengukuran implementasi.

| Prioritas | Improve | Strategi anggaran dan manfaat |
|---|---|---|
| 1 | Jalankan matriks Safari/Firefox dan keyboard/screen reader | Pengujian di luar source dapat menambah keyakinan tanpa memperbesar runtime. Catat hasil nyata di Markdown. |
| 2 | Tes alur browser yang dapat dijalankan ulang di CI | Cadangkan sekitar 1–2 KB lewat konsolidasi CSS/handler terlebih dahulu. Prioritaskan quota, restore, dan fokus, bukan screenshot snapshot besar. |
| 3 | Composer mobile dapat dilipat sesudah menambah | Sekitar 400–800 byte; percepat kembali ke koleksi. Uji discoverability agar field tidak tersembunyi secara membingungkan. |
| 4 | Fokus ke field invalid + aria-invalid per field | Sekitar 300–600 byte setelah menghapus redundansi kecil. Membantu koreksi langsung tanpa mencari field yang dimaksud pesan. |
| 5 | Undo hapus satu langkah | Sekitar 500–900 byte; tetap pertahankan dialog konfirmasi. Simpan undo hanya dalam sesi, hindari skema persistensi baru tanpa kebutuhan. |
| 6 | Kinerja koleksi sangat besar | Uji batas 1.000 entry terlebih dahulu. Pagination lebih relevan daripada menambahkan library virtualisasi. Ukur tradeoff aksesibilitas dan source. |
| 7 | Konflik multi-tab simultan | Compare-before-write mencegah banyak stale write, tetapi localStorage tidak menyediakan transaksi atomik antar-tab. Bila penggunaan multi-tab menjadi kebutuhan nyata, evaluasi lock/merge dengan fallback dan anggaran tambahan. |

Sebelum membuat commit submission, kelompokkan perubahan secara reviewable: model/storage + tests; UI/controller; kemudian dokumentasi/tooling. Hindari memasukkan dependencies atau metadata tool, dan jangan menilai histori lama yang tidak terkait sebagai commit baru proyek ini.
