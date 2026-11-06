import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import type { Lead, LeadStatus } from "./leads";

export type LeadInput = {
  name: string;
  phone: string | null;
  address: string | null;
  notes: string | null;
  status: LeadStatus;
};

const dataDir = join(process.cwd(), "data");
mkdirSync(dataDir, { recursive: true });

// keep one connection across dev hot reloads
const g = globalThis as unknown as { leadsDb?: DatabaseSync };
const db = (g.leadsDb ??= new DatabaseSync(join(dataDir, "leads.db")));

db.exec(`
  CREATE TABLE IF NOT EXISTS leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'baru',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )
`);

// databases created before the status column existed
const columns = db.prepare("PRAGMA table_info(leads)").all() as {
  name: string;
}[];
if (!columns.some((column) => column.name === "status")) {
  db.exec("ALTER TABLE leads ADD COLUMN status TEXT NOT NULL DEFAULT 'baru'");
}

// node:sqlite rows are null-prototype objects; spread into plain objects for RSC
const toLead = (row: unknown) => ({ ...(row as object) }) as Lead;

export function listLeads(): Lead[] {
  return db
    .prepare(
      "SELECT id, name, phone, address, notes, status, created_at FROM leads ORDER BY id DESC",
    )
    .all()
    .map(toLead);
}

export function createLead(input: LeadInput): number {
  const result = db
    .prepare(
      "INSERT INTO leads (name, phone, address, notes, status) VALUES (?, ?, ?, ?, ?)",
    )
    .run(input.name, input.phone, input.address, input.notes, input.status);
  return Number(result.lastInsertRowid);
}

export function updateLead(id: number, input: LeadInput): void {
  db.prepare(
    "UPDATE leads SET name = ?, phone = ?, address = ?, notes = ?, status = ? WHERE id = ?",
  ).run(input.name, input.phone, input.address, input.notes, input.status, id);
}

export function deleteLead(id: number): void {
  db.prepare("DELETE FROM leads WHERE id = ?").run(id);
}
