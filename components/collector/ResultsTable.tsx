"use client";

import type { CollectResult } from "./types";

const CELL = "border-t border-[#eceef1] px-2 py-1 align-top";

function mapsUrl(result: CollectResult): string | null {
  const base = "https://www.google.com/maps/search/?api=1&query=";
  if (result.lat != null && result.lng != null) {
    return `${base}${result.lat},${result.lng}`;
  }
  const text = [result.name, result.address].filter(Boolean).join(" ").trim();
  return text ? `${base}${encodeURIComponent(text)}` : null;
}

export default function ResultsTable({
  results,
  selected,
  loading,
  onToggle,
  onToggleAll,
}: {
  results: CollectResult[];
  selected: Set<number>;
  loading: boolean;
  onToggle: (id: number) => void;
  onToggleAll: (checked: boolean) => void;
}) {
  if (loading) {
    return (
      <div className="rounded-sm border border-[#dfe2e6] bg-white px-3 py-2 text-[11px] text-[#8b929c]">
        Memuat hasil…
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="rounded-sm border border-[#dfe2e6] bg-white px-3 py-2 text-[11px] text-[#8b929c]">
        Belum ada hasil. Jalankan pencarian atau pilih job dari riwayat.
      </div>
    );
  }

  const allSelected = results.every((result) => selected.has(result.id));

  return (
    <div className="overflow-x-auto rounded-sm border border-[#dfe2e6] bg-white">
      <table className="w-full border-collapse text-[11px]">
        <thead>
          <tr className="bg-[#f4f6f8] text-left text-[#5b626b]">
            <th className="w-[28px] px-2 py-1">
              <input
                type="checkbox"
                aria-label="Pilih semua hasil"
                checked={allSelected}
                onChange={(event) => onToggleAll(event.target.checked)}
                className="size-3.5 accent-[#3a7bdd]"
              />
            </th>
            <th className="px-2 py-1 font-semibold">Nama</th>
            <th className="px-2 py-1 font-semibold">Kategori</th>
            <th className="px-2 py-1 font-semibold">Alamat</th>
            <th className="px-2 py-1 font-semibold">Telepon</th>
            <th className="px-2 py-1 font-semibold">Website</th>
            <th className="px-2 py-1 font-semibold">Peta</th>
          </tr>
        </thead>
        <tbody>
          {results.map((result) => {
            const url = mapsUrl(result);
            return (
              <tr key={result.id} className="text-[#3a3f45]">
                <td className={CELL}>
                  <input
                    type="checkbox"
                    aria-label={`Pilih ${result.name}`}
                    checked={selected.has(result.id)}
                    onChange={() => onToggle(result.id)}
                    className="size-3.5 accent-[#3a7bdd]"
                  />
                </td>
                <td className={`${CELL} font-medium`}>{result.name || "—"}</td>
                <td className={CELL}>{result.category || "—"}</td>
                <td className={CELL}>{result.address || "—"}</td>
                <td className={`${CELL} whitespace-nowrap`}>
                  {result.phone || "—"}
                </td>
                <td className={CELL}>
                  {result.website ? (
                    <a
                      href={result.website}
                      target="_blank"
                      rel="noopener"
                      className="block max-w-[220px] truncate text-[#1d4e9c] hover:underline"
                    >
                      {result.website}
                    </a>
                  ) : (
                    "—"
                  )}
                </td>
                <td className={`${CELL} whitespace-nowrap`}>
                  {url ? (
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener"
                      className="text-[#1d4e9c] hover:underline"
                    >
                      Buka di Google Maps
                    </a>
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
