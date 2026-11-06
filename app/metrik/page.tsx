import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import Metrics from "@/components/metrics/Metrics";
import { listLeads } from "@/lib/db";

export const metadata: Metadata = {
  title: "Metrik — Leads Surveillance",
  description: "Ringkasan status, funnel konversi, dan tren lead mingguan",
};

async function MetricsData() {
  await connection();
  return <Metrics leads={listLeads()} />;
}

export default function Metrik() {
  return (
    <main className="min-h-screen bg-[#e9ecee] p-4 text-[12px] leading-tight text-[#2c3138]">
      <Link
        href="/"
        className="inline-flex h-[24px] items-center rounded-sm border border-[#d7dade] bg-white px-2 text-[11px] text-[#3a3f45] hover:bg-[#f4f6f8]"
      >
        ← Kembali ke dashboard
      </Link>
      <Suspense
        fallback={<p className="mt-3 text-[#7d848d]">Memuat metrik…</p>}
      >
        <MetricsData />
      </Suspense>
    </main>
  );
}
