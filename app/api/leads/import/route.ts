import { importLeads } from "@/lib/db";

function jsonError(message: string, status: number): Response {
  return Response.json({ error: message }, { status });
}

function extractCsv(body: unknown): string | null {
  if (body === null || typeof body !== "object") return null;
  const value = (body as { csv?: unknown }).csv;
  return typeof value === "string" ? value : null;
}

export async function POST(request: Request): Promise<Response> {
  try {
    const contentType = request.headers.get("content-type") ?? "";
    let csv: string;

    if (contentType.includes("application/json")) {
      const body = await request.json().catch(() => null);
      const extracted = extractCsv(body);
      if (extracted === null) {
        return jsonError("Field 'csv' wajib berisi teks CSV.", 400);
      }
      csv = extracted;
    } else {
      csv = await request.text();
    }

    if (!csv.trim()) return jsonError("CSV kosong.", 400);

    const result = importLeads(csv);
    return Response.json(result, { status: 201 });
  } catch {
    return jsonError("Gagal mengimpor CSV.", 500);
  }
}
