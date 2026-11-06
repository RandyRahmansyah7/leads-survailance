# Laporan Implementasi UI dari design1–3

Dokumen ini untuk dibaca manusia **dan agent** yang melanjutkan pekerjaan di repo ini.
Referensi: `design1.jpeg`, `design2.jpeg`, `design3.jpeg` di root repo; `AGENTS.md` §Catatan Desain.

## 1. Ringkasan

- Ketiga gambar adalah **UI yang sama** pada ukuran jendela berbeda. Jadi implementasinya **satu UI responsif**, bukan tiga halaman.
- Keputusan pemilik repo (hasil sesi tanya-jawab):
  - **Label chrome dipertahankan persis** seperti design (`Find...`, `Share`, `MTS//MNF`, `UNCLASSIFIED NOTIONAL DATA`, `CarloDB Light` / `0 overlays`, `Weather` / `None`, `Online View`, teks status bar, elemen timeline).
  - **Isi panel diadaptasi ke domain leads** (tab `Lead`/`Sumber`/`Alat`, kategori `Semua Lead`/`Baru`/`Follow-up`/`Deal`/`Arsip`, tombol `+ Baru`).
  - **Area peta dikosongkan** — akan diisi Google Maps menyusul (di luar scope ini).
  - Aplikasi pribadi, **tanpa login**.
- Bagian non-peta dibuat **fungsional penuh (frontend + backend)**: CRUD lead, status, pencarian, ekspor CSV, penyimpanan SQLite.

## 2. Analisis design

### 2.1 Ukuran gambar & area aplikasi

| Gambar | Ukuran gambar | Area aplikasi (crop) | Viewport render |
| --- | --- | --- | --- |
| design1 | 1003×683 | (0,55) → (1003,679) | 1003×624 |
| design2 | 1009×685 | (3,54) → (1007,679) | 1004×625 |
| design3 | 1080×756 | (4,79) → (1076,704) | 1072×625 |

Area aplikasi = mulai bar hitam teratas (di bawah chrome browser) sampai bar bawah; chrome browser macOS **tidak** termasuk (sesuai keputusan).

### 2.2 Palet warna (hasil sampling piksel)

| Elemen | Warna |
| --- | --- |
| Bar atas (hitam) | `#15181d` |
| Teks `Share` | `#5e9cd6` |
| Strip hijau | `#0e7f51` |
| Tab bar panel kiri | `#373e48` |
| Underline tab aktif | ~`#3a7bdd` |
| Panel kiri | `#ffffff` |
| Ikon entity (biru) | `#3f6fd8` |
| Ikon rosette ungu | `#7a5ed0` |
| Ikon live (hijau) | `#2e9e63` |
| Chip footer (`CarloDB Light`) | `#eeeff3` |
| Strip cuaca | `#eef0f4` |
| Bar bawah kiri (gelap) | `#393d48`, teks `Online` `#e8a13c`, `View` `#5b9bd5` |
| Chip `Live` biru (jam) | `#2b7cd3` |
| Chip `Live` pink | `#f7cacd` |
| Latar area peta (design) | ~`#e9ecee` |

### 2.3 Metrik elemen (dari pengukuran gambar)

- Bar atas: 20–22px; strip hijau: 19–20px; tab bar panel: 33px; lebar panel kiri: 248px; baris tree: 30px; bar bawah: 21–22px; timeline: ±26px; tile toolbar kanan: 22px.

## 3. Pemetaan elemen design → implementasi

| Elemen design | Implementasi | File |
| --- | --- | --- |
| Bar atas + menu `File…✓ Saved`, judul tengah, `Share`, `MTS//MNF`, fullscreen | `TopBar` (Share = salin URL, bintang = tersimpan lokal, fullscreen = nyata; menu inert) | `components/shell/TopBar.tsx` |
| Strip hijau `UNCLASSIFIED NOTIONAL DATA` | `GreenStrip` (persis) | `components/shell/Chrome.tsx` |
| Tab bar `Map layers / Data sources / Tools` | tab `Lead / Sumber / Alat` (adaptasi) | `components/shell/LeftPanel.tsx` |
| `Find...` + tree layer | pencarian + tree lead per status (lihat §4) | `components/shell/LeftPanel.tsx` |
| Chip `CarloDB Light · 0 overlays` | sama persis (dekoratif) | `components/shell/LeftPanel.tsx` |
| Strip `Weather │ None` + ikon cuaca + gear | `WeatherStrip` (dekoratif) | `components/shell/Chrome.tsx` |
| Bar `Adding to … + New ‹` + panel `SYMBOL` | panel editor lead (`Menambah ke … + Baru ‹`), baris `SYMBOL` (alat gambar peta) dihilangkan | `components/shell/LeadEditor.tsx` |
| Toolbar ikon kanan (3 grup + bell) | 3 grup tile + bell; aksi peta inert dengan tooltip "menyusul dengan peta" | `components/shell/RightToolbar.tsx` |
| Timeline + chip `Live h:mm:ss` + tombol sudut + chip pink `Live` | tanggal = minggu berjalan, jam = waktu nyata (berdetak), chip pink persis | `components/shell/Timeline.tsx`, `Chrome.tsx` |
| Bar bawah `● Online View │ 72 interactive elements │ ⟳ ⊕` | `Online View` + jumlah lead nyata + tombol muat ulang / lead baru | `components/shell/Chrome.tsx` |
| Bar bawah putih `Select objects on the map to get started` | persis + chip `Live` pink | `components/shell/Chrome.tsx` |
| Ikon entity & logo | SVG custom | `components/shell/icons.tsx` |
| Ikon lain (funnel, rosette, live, dll.) | aproksimasi `lucide-react` | `components/shell/*.tsx` |

## 4. Fitur fungsional (non-peta)

- **CRUD lead**: tambah (`+ Baru` di editor, bar bawah kiri, atau empty-state), ubah, hapus (dengan konfirmasi).
- **Status**: `baru`, `follow-up`, `deal`, `arsip` — tree panel kiri menampilkan grup per status.
- **Pencarian** `Find...`: filter nama/telepon/alamat/catatan (grup otomatis terbuka saat mencari).
- **Tab `Sumber`**: info penyimpanan + jumlah lead per status.
- **Tab `Alat`**: muat ulang, ekspor CSV, buka tab baru.
- **Validasi**: nama wajib (client + server action); panjang field dibatasi di server (`lib/actions.ts`) — boundary validasi.
- **Penyimpanan**: SQLite `data/leads.db` via `node:sqlite` (tidak ikut git). Migrasi otomatis menambah kolom `status` untuk DB lama.
- **Server actions**: `saveLead`, `deleteLeadAction` → memanggil `refresh()` (Next 16) agar data dinamis di-render ulang.
- Halaman membaca DB di request time (`await connection()` + `<Suspense>`) sesuai pola Cache Components Next 16.4 (`cacheComponents: true`).

## 5. Verifikasi akurasi

- Metode: Chrome headless (`--headless=new`) pada **viewport persis** area aplikasi tiap design, lalu pencarian alignment ±6px dan perbandingan piksel dengan toleransi selisih channel ≤ 24.
- Ulangi verifikasi: `python3 docs/verify-design-diff.py` (lihat header script untuk langkah screenshot).

| Design | Match ≤24 (seluruh area) | Match ≤24 (tanpa area peta) | MAE | Offset alignment |
| --- | --- | --- | --- | --- |
| design1 | 86.6% | 82.7% | 18.1 | (0, −4) |
| design2 | 87.7% | 84.4% | 17.7 | (2, −2) |
| design3 | 85.9% | 80.1% | 20.0 | (2, −2) |

Interpretasi:
- **Area peta ≈ 63% dari gambar** dan memang dikosongkan (menunggu Google Maps) — kontributor selisih terbesar. Inilah alasan utama angka tidak ~100%.
- Sisa selisih (setelah area peta dikecualikan) berasal dari: teks/label yang **sengaja diadaptasi** (nama tab, kategori, isi tree, angka `6 lead` vs `72 interactive elements`, tanggal timeline, judul app), rendering font (Geist vs font Palantir), dan aproksimasi ikon.
- Artefak: `docs/screenshots/render-d*.png` (hasil render), `docs/screenshots/side-by-side-d*.png` (design | render | heatmap).

## 6. Deviasi & aproksimasi (disengaja)

1. Chrome browser macOS tidak dibuat (keputusan pemilik repo).
2. Area peta kosong + label kecil "Area peta — integrasi Google Maps menyusul".
3. Label panel & isi tree diadaptasi ke leads (lihat §1); label chrome dipertahankan persis.
4. Baris `SYMBOL` (alat menggambar simbol peta) tidak diimplementasikan — bagian dari integrasi peta.
5. Ikon pihak ketiga memakai `lucide-react` sebagai aproksimasi glyph Palantir; glyph entity & logo dibuat custom.
6. Timeline memakai tanggal minggu berjalan (bukan `3/15/2022`) dan jam nyata; chip pink `Live` dekoratif.
7. Tombol toolbar kanan yang berhubungan peta = inert + tooltip "menyusul dengan peta". Tombol yang hidup: fullscreen, sembunyikan/tampilkan toolbar, muat ulang, `+ Baru`, ekspor CSV, Share, bintang tersimpan.
8. `components/LeadsDashboard.tsx` dan `components/MapEmbed.tsx` (versi awal issue #1) dihapus — tersedia di riwayat git.
9. Font memakai Geist bawaan scaffold (font Palantir proprietary, tidak disertakan).

## 7. Struktur file hasil

```
app/page.tsx                      halaman utama (server) → Shell
components/shell/Shell.tsx        root client: state seleksi/editor/toolbar
components/shell/TopBar.tsx       bar hitam atas
components/shell/LeftPanel.tsx    tab Lead/Sumber/Alat, Find..., tree lead
components/shell/LeadEditor.tsx   panel editor lead (tambah/ubah/hapus)
components/shell/Timeline.tsx     timeline + jam live
components/shell/RightToolbar.tsx toolbar ikon kanan
components/shell/Chrome.tsx       GreenStrip, WeatherStrip, bar bawah
components/shell/icons.tsx        glyph custom
lib/leads.ts                      tipe Lead + STATUSES (aman untuk client)
lib/db.ts                         SQLite + skema + migrasi + query
lib/actions.ts                    server actions (validasi + refresh)
```

## 8. Langkah lanjutan (integrasi Google Maps)

1. Ganti placeholder peta di `Shell.tsx` (div "Area peta — …") dengan komponen peta.
2. Tambah kolom `lat`/`lng` di tabel `leads` saat integrasi (migrasi pola sama seperti kolom `status`).
3. Hidupkan tombol toolbar/timeline yang saat ini inert (tooltip "menyusul dengan peta") dan kembalikan makna teks `Select objects on the map to get started`.
4. Bila ingin akurasi visual peta mendekati design2/3: pertimbangkan gaya peta terang (light) dan marker biru.
