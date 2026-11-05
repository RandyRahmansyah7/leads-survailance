import { Suspense } from "react";
import { connection } from "next/server";
import LeadsDashboard from "@/components/LeadsDashboard";
import { listLeads } from "@/lib/db";

async function Leads() {
  await connection();
  return <LeadsDashboard leads={listLeads()} />;
}

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-6xl p-6">
      <h1 className="mb-6 text-2xl font-bold">Leads Surveillance</h1>
      <Suspense
        fallback={<p className="text-sm text-neutral-500">Memuat leads…</p>}
      >
        <Leads />
      </Suspense>
    </main>
  );
}
