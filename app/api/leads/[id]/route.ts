import { connection } from "next/server";
import { deleteLead, getLead, updateLead } from "@/lib/db";
import { parseLeadPatch } from "@/lib/validate";

type RouteParams = { params: Promise<{ id: string }> };

function jsonError(message: string, status: number): Response {
  return Response.json({ error: message }, { status });
}

function parseId(raw: string): number | null {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function GET(
  _request: Request,
  { params }: RouteParams,
): Promise<Response> {
  try {
    await connection();
    const id = parseId((await params).id);
    if (id === null) return jsonError("Id tidak valid.", 400);

    const lead = getLead(id);
    if (!lead) return jsonError("Lead tidak ditemukan.", 404);

    return Response.json({ item: lead });
  } catch {
    return jsonError("Gagal memuat lead.", 500);
  }
}

export async function PATCH(
  request: Request,
  { params }: RouteParams,
): Promise<Response> {
  try {
    const id = parseId((await params).id);
    if (id === null) return jsonError("Id tidak valid.", 400);

    const body = await request.json().catch(() => null);
    const parsed = parseLeadPatch(body);
    if (!parsed.ok) return jsonError(parsed.error, 400);

    const updated = updateLead(id, parsed.value);
    if (!updated) return jsonError("Lead tidak ditemukan.", 404);

    return Response.json({ item: getLead(id) });
  } catch {
    return jsonError("Gagal memperbarui lead.", 500);
  }
}

export async function DELETE(
  _request: Request,
  { params }: RouteParams,
): Promise<Response> {
  try {
    const id = parseId((await params).id);
    if (id === null) return jsonError("Id tidak valid.", 400);

    const deleted = deleteLead(id);
    if (!deleted) return jsonError("Lead tidak ditemukan.", 404);

    return Response.json({ ok: true, id });
  } catch {
    return jsonError("Gagal menghapus lead.", 500);
  }
}
