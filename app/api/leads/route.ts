import { connection } from "next/server";
import { createLead, getLead, queryLeads } from "@/lib/db";
import { isLeadStatus } from "@/lib/leads";
import { parseLeadInput } from "@/lib/validate";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 200;

function jsonError(message: string, status: number): Response {
  return Response.json({ error: message }, { status });
}

function positiveInt(value: string | null, fallback: number, max: number): number {
  if (value === null) return fallback;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return Math.min(Math.floor(parsed), max);
}

export async function GET(request: Request): Promise<Response> {
  try {
    await connection();
    const { searchParams } = new URL(request.url);

    const statusParam = searchParams.get("status");
    if (statusParam && !isLeadStatus(statusParam)) {
      return jsonError("Status tidak valid.", 400);
    }

    const page = positiveInt(searchParams.get("page"), 1, Number.MAX_SAFE_INTEGER);
    const limit = positiveInt(searchParams.get("limit"), DEFAULT_LIMIT, MAX_LIMIT);

    const { items, total } = queryLeads({
      q: searchParams.get("q") ?? undefined,
      status: statusParam ?? undefined,
      limit,
      offset: (page - 1) * limit,
    });

    return Response.json({ items, total, page, limit });
  } catch {
    return jsonError("Gagal memuat data lead.", 500);
  }
}

export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json().catch(() => null);
    const parsed = parseLeadInput(body);
    if (!parsed.ok) return jsonError(parsed.error, 400);

    const id = createLead(parsed.value);
    return Response.json({ item: getLead(id) }, { status: 201 });
  } catch {
    return jsonError("Gagal menyimpan lead.", 500);
  }
}
