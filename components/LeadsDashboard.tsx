"use client";

import { useState } from "react";
import type { Lead } from "@/lib/db";
import MapEmbed from "./MapEmbed";

export default function LeadsDashboard({ leads }: { leads: Lead[] }) {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const selected = leads.find((lead) => lead.id === selectedId);

  return (
    <div className="grid gap-8 lg:grid-cols-[3fr_2fr]">
      <section>
        {leads.length === 0 ? (
          <p className="text-sm text-neutral-500">Belum ada lead.</p>
        ) : (
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-neutral-300 text-left dark:border-neutral-700">
                <th scope="col" className="py-2 pr-4 font-medium">
                  Nama
                </th>
                <th scope="col" className="py-2 pr-4 font-medium">
                  Telepon
                </th>
                <th scope="col" className="py-2 font-medium">
                  Alamat
                </th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr
                  key={lead.id}
                  onClick={() => setSelectedId(lead.id)}
                  className={`cursor-pointer border-b border-neutral-200 dark:border-neutral-800 ${
                    lead.id === selectedId
                      ? "bg-neutral-100 dark:bg-neutral-800"
                      : "hover:bg-neutral-50 dark:hover:bg-neutral-900"
                  }`}
                >
                  <td className="py-2 pr-4">
                    <button type="button" className="text-left">
                      {lead.name}
                    </button>
                  </td>
                  <td className="py-2 pr-4">{lead.phone ?? "—"}</td>
                  <td className="py-2">{lead.address ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <aside className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
        {selected ? (
          <div className="space-y-3 text-sm">
            <h2 className="text-lg font-semibold">{selected.name}</h2>
            <p>
              <span className="block text-neutral-500">Telepon</span>
              {selected.phone ?? "—"}
            </p>
            <p>
              <span className="block text-neutral-500">Alamat</span>
              {selected.address ?? "—"}
            </p>
            <p>
              <span className="block text-neutral-500">Catatan</span>
              <span className="whitespace-pre-wrap">
                {selected.notes ?? "—"}
              </span>
            </p>
            {selected.address && <MapEmbed query={selected.address} />}
          </div>
        ) : (
          <p className="text-sm text-neutral-500">
            Pilih salah satu lead untuk melihat detail dan peta.
          </p>
        )}
      </aside>
    </div>
  );
}
