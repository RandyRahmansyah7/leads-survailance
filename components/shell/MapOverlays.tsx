import { Frame, Grid3x3, MapPinned, PenLine, Ruler } from "lucide-react";

const TOOL_TILE =
  "flex size-4 items-center justify-center rounded-[3px] border border-[#dfe3e7] bg-white/95 text-[#4a5058] shadow-sm";

export function MapLeftTools() {
  return (
    <>
      <div className="absolute bottom-[21px] left-1 flex flex-col gap-1">
        <button
          type="button"
          title="3D (menyusul dengan peta)"
          className={`${TOOL_TILE} text-[8px] font-bold`}
        >
          3D
        </button>
        <button
          type="button"
          title="Grid (menyusul dengan peta)"
          className={TOOL_TILE}
        >
          <Grid3x3 className="size-3" />
        </button>
        <button
          type="button"
          title="Ukur (menyusul dengan peta)"
          className={TOOL_TILE}
        >
          <Ruler className="size-3" />
        </button>
        <button
          type="button"
          title="Gambar (menyusul dengan peta)"
          className={TOOL_TILE}
        >
          <PenLine className="size-3" />
        </button>
        <button
          type="button"
          title="Tandai lokasi (menyusul dengan peta)"
          className={TOOL_TILE}
        >
          <MapPinned className="size-3" />
        </button>
      </div>
      <div
        title="Slider peta (menyusul dengan peta)"
        className="absolute bottom-[2px] left-1 h-[12px] w-[170px] rounded-full border border-[#d3d6da] bg-[#d9dcdf]"
      >
        <div className="h-full w-3/4 rounded-full bg-[#c3c7cc]" />
        <div className="absolute top-1/2 left-[52%] size-[9px] -translate-y-1/2 rounded-full border border-[#b9bdc2] bg-white" />
      </div>
    </>
  );
}

export function MapEdgeControls({
  onToggleEditor,
}: {
  onToggleEditor: () => void;
}) {
  return (
    <>
      <button
        type="button"
        onClick={onToggleEditor}
        title="Buka/tutup panel lead"
        className="absolute top-[73px] left-0 flex h-[20px] items-center gap-1 rounded-r-sm border border-l-0 border-[#dfe3e7] bg-white px-1.5 text-[#4a5058] shadow-sm"
      >
        <Frame className="size-3" />
        <span className="text-[9px]">›</span>
      </button>
      <button
        type="button"
        title="Menyusul dengan peta"
        className="absolute top-[101px] left-0 flex h-[18px] w-[14px] items-center justify-center rounded-r-sm border border-l-0 border-[#dfe3e7] bg-white text-[#4a5058]"
      >
        <span className="text-[9px]">‹</span>
      </button>
    </>
  );
}
