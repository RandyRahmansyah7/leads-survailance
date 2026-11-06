import { connection } from "next/server";
import { getFunnel, getSummary, getWeeklyTrend } from "@/lib/analytics";

export async function GET(): Promise<Response> {
  try {
    await connection();
    return Response.json({
      summary: getSummary(),
      weeklyTrend: getWeeklyTrend(),
      funnel: getFunnel(),
    });
  } catch {
    return Response.json({ error: "Gagal memuat data analitik." }, { status: 500 });
  }
}
