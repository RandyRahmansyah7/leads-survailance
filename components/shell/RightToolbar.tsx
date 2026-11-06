import {
  Activity,
  Bell,
  ChartColumn,
  Clock,
  LayoutGrid,
  Layers,
  List,
  Monitor,
  PanelLeft,
  Plane,
  Search,
  ZoomIn,
} from "lucide-react";

const GROUP =
  "flex flex-col gap-0.5 rounded-sm border border-[#e3e5e9] bg-white p-0.5 shadow-sm";
const ROW_GROUP =
  "flex flex-row gap-0.5 rounded-sm border border-[#e3e5e9] bg-white p-0.5 shadow-sm";

function Tile({
  icon: Icon,
  title,
  dark = false,
  accent = false,
}: {
  icon: typeof Bell;
  title: string;
  dark?: boolean;
  accent?: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      className={`flex size-[22px] items-center justify-center rounded-sm border ${
        dark
          ? "border-[#3a3f45] bg-[#3a3f45] text-white"
          : "border-[#e3e5e9] bg-[#fbfcfd] text-[#3a3f45] hover:bg-white"
      }`}
    >
      <Icon className={`size-3.5 ${accent ? "text-[#2b7cd3]" : ""}`} />
    </button>
  );
}

export default function RightToolbar() {
  return (
    <div className="absolute top-1.5 right-1.5 bottom-[30px] flex flex-col items-center gap-1.5">
      <Tile icon={Bell} title="Notifikasi" />
      <div className="h-6" />
      <div className={GROUP}>
        <Tile icon={PanelLeft} title="Panel (menyusul dengan peta)" />
        <Tile icon={List} title="Daftar (menyusul dengan peta)" />
        <Tile icon={Activity} title="Aktivitas (menyusul dengan peta)" />
        <Tile icon={Layers} title="Layer (menyusul dengan peta)" dark />
      </div>
      <div className="flex-1" />
      <div className={GROUP}>
        <Tile icon={LayoutGrid} title="Grid (menyusul dengan peta)" />
        <Tile
          icon={ChartColumn}
          title="Statistik (menyusul dengan peta)"
          accent
        />
        <Tile icon={ZoomIn} title="Zoom (menyusul dengan peta)" />
        <Tile icon={Search} title="Cari di peta (menyusul dengan peta)" />
      </div>
      <div className={ROW_GROUP}>
        <Tile icon={Plane} title="Rute (menyusul dengan peta)" />
        <Tile icon={LayoutGrid} title="Grid (menyusul dengan peta)" />
        <Tile icon={List} title="Daftar (menyusul dengan peta)" />
        <Tile icon={Clock} title="Riwayat (menyusul dengan peta)" />
        <Tile icon={Monitor} title="Monitor (menyusul dengan peta)" />
      </div>
    </div>
  );
}
