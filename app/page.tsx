import { Suspense } from "react";
import { connection } from "next/server";
import Shell from "@/components/shell/Shell";
import { listLeads } from "@/lib/db";

async function Dashboard() {
  await connection();
  return <Shell leads={listLeads()} />;
}

export default function Home() {
  return (
    <Suspense fallback={<div className="h-screen bg-[#e9ecee]" />}>
      <Dashboard />
    </Suspense>
  );
}
