import { CirclePlus, Cloud, RotateCw, Settings, Thermometer, Wind } from "lucide-react";

export function GreenStrip() {
  return (
    <div className="flex h-[20px] shrink-0 items-center justify-center bg-[#0e7f51] text-[10px] font-medium tracking-[0.08em] text-white">
      UNCLASSIFIED NOTIONAL DATA
    </div>
  );
}

export function WeatherStrip() {
  return (
    <div className="flex h-[24px] shrink-0 items-center gap-2 border-t border-[#d9dce1] bg-[#eef0f4] px-2 text-[11px] text-[#3f4650]">
      <span className="text-[#5b626b]">Weather</span>
      <span className="h-3 w-px bg-[#cdd2d8]" />
      <span className="rounded-sm bg-[#dde1e7] px-1.5 py-px">None</span>
      <span className="h-3 w-px bg-[#cdd2d8]" />
      <Thermometer className="size-3.5" />
      <Wind className="size-3.5" />
      <Cloud className="size-3.5" />
      <span className="flex-1" />
      <Settings className="size-3.5 text-[#6b7280]" />
    </div>
  );
}

export function BottomLeft({
  count,
  onRefresh,
  onNew,
}: {
  count: number;
  onRefresh: () => void;
  onNew: () => void;
}) {
  return (
    <div className="flex h-[22px] shrink-0 items-center gap-2 bg-[#393d48] px-2 text-[10px]">
      <span className="size-1.5 rounded-full bg-[#e8a13c]" />
      <span className="font-medium text-[#e8a13c]">Online</span>
      <span className="font-medium text-[#5b9bd5]">View</span>
      <span className="text-[#8a93a3]">{count} lead</span>
      <span className="flex-1" />
      <button
        type="button"
        onClick={onRefresh}
        title="Muat ulang data"
        className="text-[#3fae7a] hover:text-[#63c99a]"
      >
        <RotateCw className="size-3.5" />
      </button>
      <button
        type="button"
        onClick={onNew}
        title="Lead baru"
        className="text-[#e8a13c] hover:text-[#f3bd6f]"
      >
        <CirclePlus className="size-3.5" />
      </button>
    </div>
  );
}

export function BottomRight() {
  return (
    <div className="relative flex h-[22px] shrink-0 items-center justify-center border-t border-[#e3e4e4] bg-[#fbfbfb] text-[11px] text-[#9aa0aa]">
      Select objects on the map to get started
      <span className="absolute right-1.5 rounded-sm bg-[#f7cacd] px-2 py-px text-[10px] text-[#7a4448]">
        Live
      </span>
    </div>
  );
}
