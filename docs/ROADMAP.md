# Roadmap — leads-survailance

Visi produk: aplikasi web lokal untuk mengumpulkan, mengelola, dan menganalisis prospek leads — arah jangka panjang mengikuti konsep analisis intelijen ala Palantir Gotham (entitas & relasi, geospasial, timeline, metrik), tetap ringan untuk laptop low-end (RAM < 4 GB).

Prinsip:
- Kecepatan & kelancaran aplikasi diutamakan; hindari dependency berat dan service terpisah yang tidak perlu.
- UI berbahasa Indonesia; referensi visual: `design1.jpeg`–`design3.jpeg` di root repo.
- Semua perubahan lewat PR + CI hijau (`main` terkunci ruleset).

## Fase 1 — UI dashboard clone design1.jpeg [STATUS: dikerjakan]
- Tata letak persis/mirip `design1.jpeg`: rapih, proporsional, Bahasa Indonesia.
- Semua kontrol fungsional (CRUD lead, pilih lead, panel detail).
- Scope: `app/**`, `components/**`.

## Fase 2 — Integrasi peta [STATUS: belum]
- Panel detail lead menampilkan peta Google Maps (iframe embed `output=embed`, TANPA API key).
- Simpan koordinat lead (lat/lng) di skema; fallback query nama+alamat bila koordinat kosong.
- Hanya SATU iframe dirender (lead terpilih) demi hemat memori.

## Fase 3 — Backend & integrasi penuh [STATUS: belum]
- Backend tetap di dalam Next.js Route Handlers + SQLite (`node:sqlite`, mode WAL) — paling cepat & ringan untuk single-user; tanpa server terpisah kecuali terbukti perlu.
- API: CRUD leads, pencarian & filter, pagination, impor/ekspor CSV.
- Siapkan skema bergaya Gotham secukupnya: entitas (lead, kontak, organisasi, lokasi), event/timeline, relasi antar-entitas.

## Fase 4 — Analitik & metrik (data science) [STATUS: belum]
- Halaman metrik: jumlah per status/kategori/wilayah, tren waktu, funnel konversi.
- Analitik lanjutan (segmentasi/clustering) dievaluasi via Python offline (terpisah dari UI, hasil diimpor).

## Aturan wave planning
- Satu wave = satu fase; jangan membuat issue untuk fase berikutnya sebelum fase saat ini selesai (tidak ada issue/PR terbuka untuk fase itu).
- Maksimal 6 issue per wave.
