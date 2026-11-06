"use client";

import type { CollectJob } from "./types";

const STATUS_LABEL: Record<string, string> = {
  done: "Selesai",
  completed: "Selesai",
  running: "Berjalan",
  pending: "Menunggu",
  failed: "Gagal",
};

const STATUS_CLASS: Record<string, string> = {
  done: "text-[#0e7f51]",
  completed: "text-[#0e7f51]",
  running: "text-[#b06a00]",
  pending: "text-[#8b929c]",
  failed: "text-[#c0392b]",
};

// created_at SQLite "YYYY-MM-DD HH:MM:SS" (UTC)
function formatDateTime(value: string): string {
  const date = new Date(value.includes("T") ? value : `${value.replace(" ", "T")}Z`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function JobHistory({
  jobs,
  activeId,
  loading,
  onSelect,
}: {
  jobs: CollectJob[];
  activeId: number | null;
  loading: boolean;
  onSelect: (id: number) => void;
}) {
  return (
    <section className="rounded-sm border border-[#dfe2e6] bg-white">
      <h2 className="border-b border-[#eceef1] px-3 py-1.5 text-[11px] font-semibold tracking-wide text-[#5b626b] uppercase">
        Riwayat job
      </h2>
      {loading ? (
        <p className="px-3 py-2 text-[11px] text-[#8b929c]">Memuat riwayat…</p>
      ) : jobs.length === 0 ? (
        <p className="px-3 py-2 text-[11px] text-[#8b929c]">
          Belum ada job pencarian.
        </p>
      ) : (
        <ul className="divide-y divide-[#eceef1]">
          {jobs.map((job) => (
            <li key={job.id}>
              <button
                type="button"
                onClick={() => onSelect(job.id)}
                className={`flex w-full items-center gap-3 px-3 py-1.5 text-left text-[11px] ${
                  job.id === activeId
                    ? "bg-[#e3ecfa] text-[#1d4e9c]"
                    : "text-[#4a5058] hover:bg-[#f4f6f8]"
                }`}
              >
                <span className="w-[92px] shrink-0 tabular-nums text-[#8b929c]">
                  {formatDateTime(job.created_at)}
                </span>
                <span className="flex-1 truncate">{job.query}</span>
                <span
                  className={`w-[70px] shrink-0 ${
                    STATUS_CLASS[job.status] ?? "text-[#5b626b]"
                  }`}
                >
                  {STATUS_LABEL[job.status] ?? job.status}
                </span>
                <span className="w-[64px] shrink-0 text-right tabular-nums text-[#5b626b]">
                  {job.total_found} hasil
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
