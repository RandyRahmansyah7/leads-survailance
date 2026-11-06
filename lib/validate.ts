import type { LeadInput, LeadPatch } from "./db";
import { isLeadStatus } from "./leads";

export type ParseResult<T> = { ok: true; value: T } | { ok: false; error: string };

class ValidationError extends Error {}

type Body = Record<string, unknown>;

function asObject(value: unknown): Body | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Body)
    : null;
}

function stringOrNull(
  value: unknown,
  max: number,
  label: string,
): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value !== "string") throw new ValidationError(`${label} harus berupa teks.`);
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (trimmed.length > max) {
    throw new ValidationError(`${label} maksimal ${max} karakter.`);
  }
  return trimmed;
}

function numberOrNull(value: unknown, label: string): number | null {
  if (value === null || value === undefined || value === "") return null;
  const parsed =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value.trim())
        : Number.NaN;
  if (!Number.isFinite(parsed)) {
    throw new ValidationError(`${label} harus berupa angka.`);
  }
  return parsed;
}

function statusOrThrow(value: unknown): LeadInput["status"] {
  if (value === null || value === undefined || value === "") return "baru";
  if (typeof value !== "string" || !isLeadStatus(value)) {
    throw new ValidationError("Status tidak valid.");
  }
  return value;
}

function fail(error: unknown): ParseResult<never> {
  return {
    ok: false,
    error: error instanceof ValidationError ? error.message : "Data tidak valid.",
  };
}

export function parseLeadInput(body: unknown): ParseResult<LeadInput> {
  try {
    const object = asObject(body);
    if (!object) throw new ValidationError("Body harus berupa objek JSON.");

    const name = stringOrNull(object.name, 200, "Nama");
    if (!name) throw new ValidationError("Nama wajib diisi.");

    return {
      ok: true,
      value: {
        name,
        phone: stringOrNull(object.phone, 100, "Telepon"),
        address: stringOrNull(object.address, 300, "Alamat"),
        notes: stringOrNull(object.notes, 2000, "Catatan"),
        status: statusOrThrow(object.status),
        category: stringOrNull(object.category, 100, "Kategori"),
        tags: stringOrNull(object.tags, 200, "Tag"),
        lat: numberOrNull(object.lat, "Latitude"),
        lng: numberOrNull(object.lng, "Longitude"),
      },
    };
  } catch (error) {
    return fail(error);
  }
}

export function parseLeadPatch(body: unknown): ParseResult<LeadPatch> {
  try {
    const object = asObject(body);
    if (!object) throw new ValidationError("Body harus berupa objek JSON.");

    const patch: LeadPatch = {};

    if ("name" in object) {
      const name = stringOrNull(object.name, 200, "Nama");
      if (!name) throw new ValidationError("Nama wajib diisi.");
      patch.name = name;
    }
    if ("phone" in object) patch.phone = stringOrNull(object.phone, 100, "Telepon");
    if ("address" in object) {
      patch.address = stringOrNull(object.address, 300, "Alamat");
    }
    if ("notes" in object) patch.notes = stringOrNull(object.notes, 2000, "Catatan");
    if ("status" in object) {
      if (typeof object.status !== "string" || !isLeadStatus(object.status)) {
        throw new ValidationError("Status tidak valid.");
      }
      patch.status = object.status;
    }
    if ("category" in object) {
      patch.category = stringOrNull(object.category, 100, "Kategori");
    }
    if ("tags" in object) patch.tags = stringOrNull(object.tags, 200, "Tag");
    if ("lat" in object) patch.lat = numberOrNull(object.lat, "Latitude");
    if ("lng" in object) patch.lng = numberOrNull(object.lng, "Longitude");

    if (Object.keys(patch).length === 0) {
      throw new ValidationError("Tidak ada kolom yang diperbarui.");
    }

    return { ok: true, value: patch };
  } catch (error) {
    return fail(error);
  }
}
