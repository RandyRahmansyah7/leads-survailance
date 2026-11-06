"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import JobHistory from "./JobHistory";
import ResultsTable from "./ResultsTable";
import SearchForm, { type SearchPayload } from "./SearchForm";
import type {
  CollectJob,
  CollectJobResponse,
  CollectJobsResponse,
  CollectResult,
  ImportResponse,
} from "./types";

const BUTTON_PRIMARY =
  "inline-flex h-[26px] items-center justify-center rounded-sm border border-[#2b6cb0] bg-[#3a7bdd] px-3 text-[11px] font-medium text-white hover:bg-[#3270cc] disabled:cursor-not-allowed disabled:opacity-50";

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  const data: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const message =
      data &&
      typeof data === "object" &&
      "error" in data &&
      typeof (data as { error: unknown }).error === "string"
        ? (data as { error: string }).error
        : `Permintaan gagal (${response.status}).`;
    throw new Error(message);
  }
  if (data === null) throw new Error("Respons server tidak valid.");
  return data as T;
}

export default function Collector() {
  const [job, setJob] = useState<CollectJob | null>(null);
  const [results, setResults] = useState<CollectResult[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [jobs, setJobs] = useState<CollectJob[]>([]);
  const [searching, setSearching] = useState(false);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [importResult, setImportResult] = useState<ImportResponse | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await fetchJson<CollectJobsResponse>("/api/collect/jobs");
        if (active) setJobs(data.jobs ?? []);
      } catch (err) {
        if (active) setError(errorMessage(err, "Gagal memuat riwayat job."));
      } finally {
        if (active) setLoadingJobs(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  function applyJob(data: CollectJobResponse) {
    setJob(data.job);
    setResults(data.results);
    setSelected(new Set(data.results.map((result) => result.id)));
    setImportResult(null);
  }

  async function handleSearch(payload: SearchPayload) {
    setSearching(true);
    setError(null);
    setImportResult(null);
    try {
      const data = await fetchJson<CollectJobResponse>("/api/collect/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      applyJob(data);
      setJobs((current) =>
        [data.job, ...current.filter((item) => item.id !== data.job.id)].slice(
          0,
          20,
        ),
      );
    } catch (err) {
      setError(errorMessage(err, "Gagal menjalankan pencarian."));
    } finally {
      setSearching(false);
    }
  }

  async function selectJob(id: number) {
    setLoadingDetail(true);
    setError(null);
    try {
      const data = await fetchJson<CollectJobResponse>(`/api/collect/jobs/${id}`);
      applyJob(data);
    } catch (err) {
      setError(errorMessage(err, "Gagal memuat detail job."));
    } finally {
      setLoadingDetail(false);
    }
  }

  function toggle(id: number) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll(checked: boolean) {
    setSelected(checked ? new Set(results.map((result) => result.id)) : new Set());
  }

  async function importSelected() {
    if (!job) return;
    const resultIds = results
      .map((result) => result.id)
      .filter((id) => selected.has(id));
    if (resultIds.length === 0) return;

    setImporting(true);
    setError(null);
    try {
      const data = await fetchJson<ImportResponse>(
        `/api/collect/jobs/${job.id}/import`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ resultIds }),
        },
      );
      setImportResult(data);
    } catch (err) {
      setError(errorMessage(err, "Gagal mengimpor hasil."));
    } finally {
      setImporting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#e9ecee] p-4 text-[12px] leading-tight text-[#2c3138]">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h1 className="text-[15px] font-semibold">Kolektor leads</h1>
          <p className="text-[11px] text-[#7d848d]">
            Cari prospek dari penyedia data, tinjau hasil, lalu impor ke tabel
            leads.
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex h-[24px] items-center rounded-sm border border-[#d7dade] bg-white px-2 text-[11px] text-[#3a3f45] hover:bg-[#f4f6f8]"
        >
          ← Kembali ke dashboard
        </Link>
      </div>

      {error && (
        <div className="mt-3 rounded-sm border border-[#e6b8b8] bg-[#fbeaea] px-2 py-1.5 text-[11px] text-[#9c2b2b]">
          {error}
        </div>
      )}

      <div className="mt-3 space-y-3">
        <section className="rounded-sm border border-[#dfe2e6] bg-white p-3">
          <SearchForm onSubmit={handleSearch} submitting={searching} />
        </section>

        <section>
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <h2 className="text-[11px] font-semibold tracking-wide text-[#5b626b] uppercase">
              Hasil pencarian
            </h2>
            {job && (
              <span className="text-[10px] text-[#8b929c]">
                Job #{job.id} · {job.query}
              </span>
            )}
          </div>
          <ResultsTable
            results={results}
            selected={selected}
            loading={loadingDetail}
            onToggle={toggle}
            onToggleAll={toggleAll}
          />

          {results.length > 0 && (
            <div className="mt-2 flex flex-wrap items-center gap-2 rounded-sm border border-[#dfe2e6] bg-white px-3 py-2">
              <button
                type="button"
                onClick={importSelected}
                disabled={importing || selected.size === 0}
                className={BUTTON_PRIMARY}
              >
                {importing ? "Mengimpor…" : "Impor Terpilih ke Leads"}
              </button>
              <span className="text-[11px] text-[#7d848d]">
                {selected.size} dari {results.length} hasil dipilih.
              </span>
              {importResult && (
                <span className="text-[11px] text-[#0e7f51]">
                  {importResult.imported} diimpor, {importResult.skipped}{" "}
                  dilewati.
                  <Link
                    href="/"
                    className="ml-1 text-[#1d4e9c] hover:underline"
                  >
                    Buka Dashboard
                  </Link>
                </span>
              )}
            </div>
          )}
        </section>

        <JobHistory
          jobs={jobs}
          activeId={job?.id ?? null}
          loading={loadingJobs}
          onSelect={selectJob}
        />
      </div>
    </main>
  );
}
