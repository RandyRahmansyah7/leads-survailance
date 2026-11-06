import { connection } from "next/server";
import { exportLeadsCsv } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(): Promise<Response> {
  try {
    await connection();
    const csv = exportLeadsCsv();
    return new Response(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="leads.csv"',
      },
    });
  } catch {
    return Response.json({ error: "Gagal mengekspor CSV." }, { status: 500 });
  }
}
