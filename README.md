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

## Automasi Multi-Agent

Pipeline multi-agent menjalankan beberapa agent secara paralel di worktree terpisah, membuat PR, menunggu CI `checks`, lalu merge otomatis PR yang hijau.

### Prasyarat

- `kilo`, `opencode`, dan `qodercli` terinstal dan sudah login.
- `gh` CLI sudah login (`gh auth login`).

### Cara Pakai

```bash
# Pratinjau dulu tanpa perubahan
DRY_RUN=1 bash scripts/wave.sh
# Jalankan sungguhan
bash scripts/wave.sh
```

### Env Vars

| Variabel | Default | Keterangan |
| --- | --- | --- |
| `MAX_WAVES` | `5` | Jumlah wave maksimum |
| `MAX_PARALLEL` | `3` | Jumlah agent paralel per wave |
| `MILESTONE` | (opsional) | Filter milestone issue |
| `PLANNING` | `1` | Aktifkan tahap planning Kilo |
| `NO_MERGE` | `0` | Set `1` untuk melewati merge otomatis |
| `DRY_RUN` | `0` | Set `1` untuk simulasi tanpa eksekusi |

### Alur Singkat

Kilo planning membuat issue wave → 3 agent bekerja paralel di worktree → PR dibuat → CI `checks` → `merge-green.sh` merge PR hijau → ulang sampai antrian habis.

### Log

Semua log tersimpan di `logs/`.

### Pembagian Peran Agent

- **Kilo** (`agent:kilo`): perencana (membuat issue wave via `gh issue create`) + worker + debug.
- **OpenCode** (`agent:opencode`): build only.
- **QoderCLI** (`agent:qoder`): build + debug specialist (prioritas `role:debug`).
