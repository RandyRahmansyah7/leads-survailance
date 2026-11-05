import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";

export type Lead = {
  id: number;
  name: string;
  phone: string | null;
  address: string | null;
  notes: string | null;
  created_at: string;
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
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )
`);

export function listLeads(): Lead[] {
  return db
    .prepare(
      "SELECT id, name, phone, address, notes, created_at FROM leads ORDER BY id DESC",
    )
    .all()
    // node:sqlite rows are null-prototype objects; spread into plain objects for RSC
    .map((row) => ({ ...row })) as unknown as Lead[];
}
