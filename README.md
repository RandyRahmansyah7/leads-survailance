# leads-survailance

Aplikasi web lokal untuk mengumpulkan dan mengelola prospek (leads), dengan UI bergaya peta operasi (mengacu `design1.jpeg`–`design3.jpeg`). Dipakai pribadi di localhost, tanpa login.

## Menjalankan

Butuh Node.js 24+ (memakai modul `node:sqlite` bawaan).

```bash
npm install
npm run dev
```

Buka http://localhost:3000.

Skrip lain: `npm run build`, `npm run lint`, `npm run format`.

## Fitur

- Kelola lead: tambah/edit/hapus, status (Baru/Follow-up/Deal/Arsip), catatan.
- Panel kiri: daftar lead per status + pencarian ("Find..."), tab Sumber (info penyimpanan) dan Alat (muat ulang, ekspor CSV).
- Editor lead melayang di area peta (tombol `+ Baru`).
- Data tersimpan lokal di SQLite (`data/leads.db`, tidak ikut git).
- Area peta sengaja dikosongkan — akan diisi Google Maps menyusul.

## Struktur

- `app/page.tsx` — halaman utama, merender shell dashboard.
- `components/shell/` — UI shell: `TopBar`, `LeftPanel`, `LeadEditor`, `Timeline`, `RightToolbar`, `Chrome`.
- `lib/leads.ts` — tipe + daftar status (aman untuk client).
- `lib/db.ts` — akses SQLite, skema, migrasi.
- `lib/actions.ts` — server actions (simpan/hapus lead).
- `docs/design-clone-report.md` — laporan implementasi UI dari design.

## Menambah data manual

Setelah aplikasi pernah dijalankan (`data/leads.db` dibuat otomatis):

```bash
node -e "const { DatabaseSync } = require('node:sqlite'); const db = new DatabaseSync('data/leads.db'); db.prepare('INSERT INTO leads (name, phone, address, notes, status) VALUES (?, ?, ?, ?, ?)').run('Nama Contoh', '0812xxxxxxx', 'Jl. Contoh No. 1, Bandung', 'Catatan', 'baru')"
```

## Catatan

- Tanpa Google Maps API key: peta nanti memakai integrasi yang dipilih menyusul.
- Tabel `leads`: `id`, `name`, `phone`, `address`, `notes`, `status`, `created_at`.
