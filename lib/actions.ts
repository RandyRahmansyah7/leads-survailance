"use server";

import { refresh } from "next/cache";
import { createLead, deleteLead, updateLead, type LeadInput } from "./db";
import { STATUSES, type LeadStatus } from "./leads";

export type SaveResult = { ok: true; id: number } | { ok: false; error: string };

const STATUS_IDS: string[] = STATUSES.map((status) => status.id);

function field(formData: FormData, name: string, max: number): string {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function saveLead(
  _prev: SaveResult | null,
  formData: FormData,
): Promise<SaveResult> {
  const name = field(formData, "name", 200);
  if (!name) return { ok: false, error: "Nama wajib diisi." };

  const status = field(formData, "status", 20);
  const input: LeadInput = {
    name,
    phone: field(formData, "phone", 100) || null,
    address: field(formData, "address", 300) || null,
    notes: field(formData, "notes", 2000) || null,
    status: (STATUS_IDS.includes(status) ? status : "baru") as LeadStatus,
  };

  const id = field(formData, "id", 12);
  if (id && Number.isInteger(Number(id))) {
    updateLead(Number(id), input);
    refresh();
    return { ok: true, id: Number(id) };
  }

  const newId = createLead(input);
  refresh();
  return { ok: true, id: newId };
}

export async function deleteLeadAction(id: number): Promise<void> {
  if (!Number.isInteger(id)) return;
  deleteLead(id);
  refresh();
}
