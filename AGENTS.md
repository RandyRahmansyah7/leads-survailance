<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Multi-Agent Automation

### Matriks Peran

| Agent | Label | Peran |
| --- | --- | --- |
| Kilo | `agent:kilo` | Perencana (membuat issue wave via `gh issue create`) + worker + debug |
| OpenCode | `agent:opencode` | Build only |
| QoderCLI | `agent:qoder` | Build + debug specialist (prioritas `role:debug`) |

### Aturan Kerja

- Kerjakan HANYA issue dengan label agent-mu.
- Patuhi whitelist "Scope file" di issue; jangan sentuh file di luar itu.
- Satu issue = satu branch = satu PR. Body PR wajib memuat `Closes #N` dan `Agent: <nama>`.
- Jangan pernah push langsung ke `main` — wajib lewat PR dan CI.
- Hanya Kilo yang membuat issue tugas baru.
- Jalankan `npm run lint` + `npx tsc --noEmit` sebelum push.
- Jangan jalankan `npm run dev`/`npm run build` di laptop — CI yang build.

### Definition of Done

- `npm run lint` lolos
- `npx tsc --noEmit` lolos
- CI hijau (job `checks`)
- PR sesuai scope issue

### Label Queue

`agent:kilo`, `agent:opencode`, `agent:qoder`, `role:build`, `role:debug`, `area:frontend`, `area:backend`, `area:infra`

Planning membuat maksimal 6 issue per wave.

### Runtime

- Jalankan: `bash scripts/wave.sh`
- Env: `MAX_WAVES`, `MAX_PARALLEL`, `MILESTONE`, `PLANNING`, `NO_MERGE`, `DRY_RUN`
- Logs di `logs/`
- Worktree di `.worktrees/`
- Prompt template di `scripts/prompts/`

### Catatan Desain

`design1.jpeg`–`design3.jpeg` di root adalah referensi UI (ditangani terpisah via opencode).
