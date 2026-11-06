"use client";

import { ChevronsRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { Lead } from "@/lib/leads";
import { BottomLeft, BottomRight, GreenStrip, WeatherStrip } from "./Chrome";
import LeadEditor from "./LeadEditor";
import LeftPanel from "./LeftPanel";
import { MapEdgeControls, MapLeftTools } from "./MapOverlays";
import RightToolbar from "./RightToolbar";
import Timeline from "./Timeline";
import TopBar from "./TopBar";

export default function Shell({ leads }: { leads: Lead[] }) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [creating, setCreating] = useState(false);
  const [editorCollapsed, setEditorCollapsed] = useState(false);
  const [showToolbar, setShowToolbar] = useState(true);

  const selected = useMemo(
    () => leads.find((lead) => lead.id === selectedId) ?? null,
    [leads, selectedId],
  );

  function selectLead(id: number) {
    setCreating(false);
    setSelectedId(id);
  }

  function startCreating() {
    setSelectedId(null);
    setCreating(true);
  }

  function toggleFullscreen() {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void document.documentElement.requestFullscreen();
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#e9ecee] text-[12px] leading-tight text-[#2c3138]">
      <TopBar onFullscreen={toggleFullscreen} />
      <GreenStrip />
      <div className="flex min-h-0 flex-1">
        <div className="flex w-[248px] shrink-0 flex-col border-r border-[#dfe2e6] bg-white">
          <LeftPanel
            leads={leads}
            selectedId={selected?.id ?? null}
            onSelect={selectLead}
            onNew={startCreating}
            onRefresh={() => router.refresh()}
          />
          <WeatherStrip />
          <BottomLeft
            count={leads.length}
            onRefresh={() => router.refresh()}
            onNew={startCreating}
          />
        </div>
        <div className="relative flex min-w-0 flex-1 flex-col">
          <div className="relative min-h-0 flex-1">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-sm border border-[#d7dade] bg-[#f2f3f4]/90 px-2 py-1 text-[11px] text-[#7d848d]">
              Area peta — integrasi Google Maps menyusul
            </div>
            <MapLeftTools />
            <MapEdgeControls
              onToggleEditor={() => setEditorCollapsed((value) => !value)}
            />
            <LeadEditor
              lead={selected}
              creating={creating}
              collapsed={editorCollapsed}
              onCollapsedChange={setEditorCollapsed}
              onSaved={selectLead}
              onDone={() => setCreating(false)}
              onDeleted={() => {
                setSelectedId(null);
                setCreating(false);
              }}
              onNew={startCreating}
            />
            {showToolbar ? (
              <RightToolbar />
            ) : (
              <button
                type="button"
                title="Tampilkan toolbar"
                onClick={() => setShowToolbar(true)}
                className="absolute top-1.5 right-1.5 flex size-[22px] items-center justify-center rounded-sm border border-[#e3e5e9] bg-white text-[#3a3f45]"
              >
                <ChevronsRight className="size-3.5" />
              </button>
            )}
          </div>
          <Timeline
            onFullscreen={toggleFullscreen}
            onToggleToolbar={() => setShowToolbar((value) => !value)}
          />
          <BottomRight />
        </div>
      </div>
    </div>
  );
}
