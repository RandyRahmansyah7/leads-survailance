"use client";

import {
  Aperture,
  ChevronDown,
  ChevronRight,
  Database,
  Funnel,
  Map,
  Rss,
  Wrench,
} from "lucide-react";
import { useMemo, useState } from "react";
import { STATUSES, STATUS_LABEL, type Lead } from "@/lib/leads";
import { EntityGlyph } from "./icons";

type Tab = "lead" | "sumber" | "alat";

const TABS: { id: Tab; label: string; icon: typeof Map }[] = [
  { id: "lead", label: "Lead", icon: Map },
  { id: "sumber", label: "Sumber", icon: Database },
  { id: "alat", label: "Alat", icon: Wrench },
];

const BUTTON =
  "flex h-[26px] w-full items-center justify-center gap-1.5 rounded-sm border border-[#d7dade] bg-white text-[11px] hover:bg-[#f4f6f8]";

function GroupGlyph({ id, className }: { id: string; className?: string }) {
  if (id === "all" || id === "baru") return <EntityGlyph className={className} />;
  return <Aperture className={className} />;
}

export default function LeftPanel({
  leads,
  selectedId,
  onSelect,
  onNew,
  onRefresh,
}: {
  leads: Lead[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  onNew: () => void;
  onRefresh: () => void;
}) {
  const [tab, setTab] = useState<Tab>("lead");
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    all: true,
  });

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const match = (lead: Lead) =>
      !q ||
      [lead.name, lead.phone ?? "", lead.address ?? "", lead.notes ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(q);
    return [
      {
        id: "all",
        label: "Semua Lead",
        live: true,
        items: leads.filter(match),
      },
      ...STATUSES.map((status) => ({
        id: status.id as string,
        label: status.label,
        live: status.id === "baru",
        items: leads
          .filter((lead) => lead.status === status.id)
          .filter(match),
      })),
    ];
  }, [leads, query]);

  const filtering = query.trim().length > 0;

  function toggleGroup(id: string) {
    setExpanded((current) => ({ ...current, [id]: !current[id] }));
  }

  function exportCsv() {
    const header = [
      "id",
      "nama",
      "telepon",
      "alamat",
      "status",
      "catatan",
      "dibuat",
    ];
    const rows = leads.map((lead) => [
      lead.id,
      lead.name,
      lead.phone ?? "",
      lead.address ?? "",
      STATUS_LABEL[lead.status],
      lead.notes ?? "",
      lead.created_at,
    ]);
    const csv = [header, ...rows]
      .map((row) =>
        row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","),
      )
      .join("\n");
    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <div className="flex h-[33px] shrink-0 items-stretch bg-[#373e48] text-[11px]">
        {TABS.map(({ id, label, icon: Icon }) => {
          const active = tab === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`flex items-center gap-1.5 border-b-2 px-3 ${
                active
                  ? "border-[#3a7bdd] text-white"
                  : "border-transparent text-[#9aa2ad] hover:text-[#ccd2d9]"
              }`}
            >
              <Icon className="size-3.5" />
              {label}
            </button>
          );
        })}
      </div>

      {tab === "lead" && (
        <>
          <div className="flex h-[31px] shrink-0 items-center gap-2 border-b border-[#eceef1] px-2">
            <Funnel className="size-3.5 shrink-0 text-[#3a3f45]" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Find..."
              className="w-full bg-transparent text-[12px] outline-none placeholder:text-[#8b929c]"
            />
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto pt-0.5 pb-1">
            {leads.length === 0 && !filtering && (
              <button
                type="button"
                onClick={onNew}
                className="w-full px-3 py-2 text-left text-[11px] text-[#8b929c] hover:text-[#1d4e9c]"
              >
                Belum ada lead. Klik + Baru untuk menambah.
              </button>
            )}
            {groups.map((group) => {
              const open = filtering || expanded[group.id];
              if (filtering && group.items.length === 0) return null;
              return (
                <div key={group.id}>
                  <div className="flex h-[30px] items-center gap-1.5 px-2 hover:bg-[#f4f6f8]">
                    <button
                      type="button"
                      onClick={() => toggleGroup(group.id)}
                      aria-label={open ? "Tutup grup" : "Buka grup"}
                      className="flex size-4 items-center justify-center text-[#5b626b]"
                    >
                      {open ? (
                        <ChevronDown className="size-3.5" />
                      ) : (
                        <ChevronRight className="size-3.5" />
                      )}
                    </button>
                    <GroupGlyph
                      id={group.id}
                      className={`size-4 ${
                        group.id === "arsip"
                          ? "text-[#7a5ed0]"
                          : "text-[#3f6fd8]"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => toggleGroup(group.id)}
                      className="flex-1 truncate text-left"
                    >
                      {group.label}
                    </button>
                    {group.live && (
                      <Rss className="size-3.5 shrink-0 text-[#2e9e63]" />
                    )}
                  </div>
                  {open &&
                    group.items.map((lead) => (
                      <button
                        key={`${group.id}-${lead.id}`}
                        type="button"
                        onClick={() => onSelect(lead.id)}
                        className={`flex h-[28px] w-full items-center gap-2 pr-2 pl-8 text-left ${
                          lead.id === selectedId
                            ? "bg-[#e3ecfa] text-[#1d4e9c]"
                            : "hover:bg-[#f4f6f8]"
                        }`}
                      >
                        <EntityGlyph className="size-3.5 shrink-0 text-[#3f6fd8]" />
                        <span className="truncate">{lead.name}</span>
                      </button>
                    ))}
                </div>
              );
            })}
          </div>
          <div className="shrink-0 border-t border-[#eceef1] p-1.5">
            <div className="flex items-center gap-2 rounded-sm bg-[#eeeff3] px-2 py-1 text-[11px]">
              <Map className="size-3.5 text-[#5b626b]" />
              <span className="font-semibold">CarloDB Light</span>
              <span className="text-[#8b929c]">0 overlays</span>
            </div>
          </div>
        </>
      )}

      {tab === "sumber" && (
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-3">
          <section>
            <h3 className="mb-1 text-[10px] font-semibold tracking-wide text-[#5b626b] uppercase">
              Penyimpanan
            </h3>
            <p className="font-mono text-[11px] text-[#3a3f45]">
              data/leads.db
            </p>
            <p className="mt-1 text-[11px] text-[#8b929c]">
              SQLite lokal (node:sqlite), tidak ikut git.
            </p>
          </section>
          <section>
            <h3 className="mb-1 text-[10px] font-semibold tracking-wide text-[#5b626b] uppercase">
              Jumlah lead
            </h3>
            <ul className="space-y-1">
              {STATUSES.map((status) => (
                <li key={status.id} className="flex justify-between">
                  <span>{status.label}</span>
                  <span className="text-[#5b626b]">
                    {leads.filter((lead) => lead.status === status.id).length}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-2 flex justify-between border-t border-[#eceef1] pt-2 font-medium">
              <span>Total</span>
              <span>{leads.length}</span>
            </p>
          </section>
        </div>
      )}

      {tab === "alat" && (
        <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
          <button type="button" onClick={onRefresh} className={BUTTON}>
            Muat ulang data
          </button>
          <button type="button" onClick={exportCsv} className={BUTTON}>
            Ekspor CSV
          </button>
          <button
            type="button"
            onClick={() => {
              window.open(window.location.href, "_blank");
            }}
            className={BUTTON}
          >
            Buka di tab baru
          </button>
          <p className="text-[11px] text-[#8b929c]">
            Ekspor CSV memuat semua lead beserta status dan catatan.
          </p>
        </div>
      )}
    </>
  );
}
