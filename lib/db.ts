import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { parseCsv, toCsv } from "./csv";
import { isLeadStatus, type Lead, type LeadStatus } from "./leads";

export type LeadInput = {
  name: string;
  phone: string | null;
  address: string | null;
  notes: string | null;
  status: LeadStatus;
  category?: string | null;
  tags?: string | null;
  lat?: number | null;
  lng?: number | null;
};

export type LeadPatch = Partial<LeadInput>;

export type ListParams = {
  q?: string;
  status?: string;
  limit?: number;
  offset?: number;
};

const dataDir = join(process.cwd(), "data");
mkdirSync(dataDir, { recursive: true });

// keep one connection across dev hot reloads
const g = globalThis as unknown as { leadsDb?: DatabaseSync };
const db = (g.leadsDb ??= new DatabaseSync(join(dataDir, "leads.db")));

// WAL keeps reads fast and non-blocking for single-user local usage.
db.exec("PRAGMA journal_mode = WAL");
db.exec("PRAGMA synchronous = NORMAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'baru',
    category TEXT,
    tags TEXT,
    lat REAL,
    lng REAL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT
  )
`);

// Idempotent migrations for databases created before a column existed.
const existingColumns = new Set(
  (db.prepare("PRAGMA table_info(leads)").all() as { name: string }[]).map(
    (column) => column.name,
  ),
);

const migrations: { name: string; sql: string }[] = [
  {
    name: "status",
    sql: "ALTER TABLE leads ADD COLUMN status TEXT NOT NULL DEFAULT 'baru'",
  },
  { name: "lat", sql: "ALTER TABLE leads ADD COLUMN lat REAL" },
  { name: "lng", sql: "ALTER TABLE leads ADD COLUMN lng REAL" },
  { name: "category", sql: "ALTER TABLE leads ADD COLUMN category TEXT" },
  { name: "tags", sql: "ALTER TABLE leads ADD COLUMN tags TEXT" },
  { name: "updated_at", sql: "ALTER TABLE leads ADD COLUMN updated_at TEXT" },
];

for (const migration of migrations) {
  if (!existingColumns.has(migration.name)) db.exec(migration.sql);
}

const LEAD_COLUMNS =
  "id, name, phone, address, notes, status, category, tags, lat, lng, created_at, updated_at";

// node:sqlite rows are null-prototype objects; spread into plain objects for RSC
const toLead = (row: unknown) => ({ ...(row as object) }) as Lead;

function whereClause(params: ListParams): { clause: string; values: string[] } {
  const conditions: string[] = [];
  const values: string[] = [];

  const q = params.q?.trim();
  if (q) {
    const like = `%${q}%`;
    conditions.push(
      "(name LIKE ? OR phone LIKE ? OR address LIKE ? OR notes LIKE ? OR category LIKE ? OR tags LIKE ?)",
    );
    values.push(like, like, like, like, like, like);
  }

  if (params.status && isLeadStatus(params.status)) {
    conditions.push("status = ?");
    values.push(params.status);
  }

  return {
    clause: conditions.length ? ` WHERE ${conditions.join(" AND ")}` : "",
    values,
  };
}

export function listLeads(params: ListParams = {}): Lead[] {
  const { clause, values } = whereClause(params);
  const query = `SELECT ${LEAD_COLUMNS} FROM leads${clause} ORDER BY id DESC`;

  const limit = params.limit;
  const offset = params.offset ?? 0;
  if (typeof limit === "number" && Number.isFinite(limit) && limit >= 0) {
    return db
      .prepare(`${query} LIMIT ? OFFSET ?`)
      .all(...values, limit, offset)
      .map(toLead);
  }

  return db.prepare(query).all(...values).map(toLead);
}

export function countLeads(params: ListParams = {}): number {
  const { clause, values } = whereClause(params);
  const row = db
    .prepare(`SELECT COUNT(*) AS total FROM leads${clause}`)
    .get(...values) as { total: number } | undefined;
  return row?.total ?? 0;
}

export function queryLeads(params: ListParams = {}): {
  items: Lead[];
  total: number;
} {
  return { items: listLeads(params), total: countLeads(params) };
}

export function getLead(id: number): Lead | null {
  const row = db
    .prepare(`SELECT ${LEAD_COLUMNS} FROM leads WHERE id = ?`)
    .get(id);
  return row ? toLead(row) : null;
}

export function createLead(input: LeadInput): number {
  const result = db
    .prepare(
      `INSERT INTO leads (name, phone, address, notes, status, category, tags, lat, lng)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      input.name,
      input.phone,
      input.address,
      input.notes,
      input.status,
      input.category ?? null,
      input.tags ?? null,
      input.lat ?? null,
      input.lng ?? null,
    );
  return Number(result.lastInsertRowid);
}

export function updateLead(id: number, patch: LeadPatch): boolean {
  const columns: string[] = [];
  const values: (string | number | null)[] = [];

  const assign = (column: string, value: string | number | null | undefined) => {
    if (value === undefined) return;
    columns.push(`${column} = ?`);
    values.push(value);
  };

  assign("name", patch.name);
  assign("phone", patch.phone);
  assign("address", patch.address);
  assign("notes", patch.notes);
  assign("status", patch.status);
  assign("category", patch.category);
  assign("tags", patch.tags);
  assign("lat", patch.lat);
  assign("lng", patch.lng);

  if (columns.length === 0) return false;

  columns.push("updated_at = datetime('now')");
  const result = db
    .prepare(`UPDATE leads SET ${columns.join(", ")} WHERE id = ?`)
    .run(...values, id);
  return result.changes > 0;
}

export function deleteLead(id: number): boolean {
  const result = db.prepare("DELETE FROM leads WHERE id = ?").run(id);
  return result.changes > 0;
}

export type ImportResult = { imported: number; skipped: number };

const IMPORT_FIELDS = [
  "name",
  "phone",
  "address",
  "notes",
  "status",
  "category",
  "tags",
  "lat",
  "lng",
] as const;

function text(value: string | undefined, max: number): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, max);
}

function numberOrNull(value: string | undefined): number | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

export function importLeads(csv: string): ImportResult {
  const rows = parseCsv(csv);
  if (rows.length < 2) return { imported: 0, skipped: 0 };

  const header = rows[0].map((cell) => cell.trim().toLowerCase());
  const indexOf = (field: string) => header.indexOf(field);

  const fields = Object.fromEntries(
    IMPORT_FIELDS.map((field) => [field, indexOf(field)]),
  ) as Record<(typeof IMPORT_FIELDS)[number], number>;

  let imported = 0;
  let skipped = 0;

  db.exec("BEGIN");
  try {
    for (const row of rows.slice(1)) {
      if (row.every((cell) => !cell.trim())) continue;

      const name = text(row[fields.name], 200);
      if (!name) {
        skipped += 1;
        continue;
      }

      const statusValue = text(row[fields.status], 20)?.toLowerCase();
      createLead({
        name,
        phone: text(row[fields.phone], 100),
        address: text(row[fields.address], 300),
        notes: text(row[fields.notes], 2000),
        status: isLeadStatus(statusValue) ? statusValue : "baru",
        category: text(row[fields.category], 100),
        tags: text(row[fields.tags], 200),
        lat: numberOrNull(row[fields.lat]),
        lng: numberOrNull(row[fields.lng]),
      });
      imported += 1;
    }
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }

  return { imported, skipped };
}

const EXPORT_HEADER = [
  "id",
  "name",
  "phone",
  "address",
  "notes",
  "status",
  "category",
  "tags",
  "lat",
  "lng",
  "created_at",
  "updated_at",
];

export function exportLeadsCsv(): string {
  const leads = db
    .prepare(`SELECT ${LEAD_COLUMNS} FROM leads ORDER BY id ASC`)
    .all()
    .map(toLead)
    .map((lead) => [
      lead.id,
      lead.name,
      lead.phone,
      lead.address,
      lead.notes,
      lead.status,
      lead.category,
      lead.tags,
      lead.lat,
      lead.lng,
      lead.created_at,
      lead.updated_at,
    ]);

  return toCsv([EXPORT_HEADER, ...leads]);
}
