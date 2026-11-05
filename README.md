# leads-survailance

Aplikasi web lokal untuk mengumpulkan dan mengelola prospek (leads): daftar lead dalam tabel, panel detail, dan peta Google Maps lewat embed iframe tanpa API key. Dipakai pribadi di localhost, tanpa login.

## Menjalankan

Butuh Node.js 24+ (memakai modul `node:sqlite` bawaan).

```bash
npm install
npm run dev
```

Buka http://localhost:3000.

Skrip lain: `npm run build`, `npm run lint`, `npm run format`.

## Penyimpanan data

Data disimpan di `data/leads.db` (SQLite, dibuat otomatis saat aplikasi dijalankan, tidak ikut git). Tabel `leads`: `id`, `name`, `phone`, `address`, `notes`, `created_at`.

Belum ada form input; untuk menambah data sementara setelah aplikasi pernah dijalankan:

```bash
node -e "const { DatabaseSync } = require('node:sqlite'); const db = new DatabaseSync('data/leads.db'); db.prepare('INSERT INTO leads (name, phone, address, notes) VALUES (?, ?, ?, ?)').run('Nama Contoh', '0812xxxxxxx', 'Jl. Contoh No. 1, Bandung', 'Catatan')"
```

## Catatan

- Peta memakai iframe Google Maps embed (`output=embed`), jadi tidak perlu API key maupun billing.
- Iframe peta hanya dirender untuk lead yang sedang dipilih — satu iframe saja per halaman, hemat resource.
- Struktur: `app/` (halaman App Router), `components/` (UI), `lib/db.ts` (akses SQLite).
