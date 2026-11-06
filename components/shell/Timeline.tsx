"use client";

import { Maximize2, X } from "lucide-react";
import { useEffect, useState } from "react";

const CURSOR_LEFT = "92%";
const DATE_LEFT = ["31%", "59%", "88%"];
const CORNER =
  "flex size-[18px] items-center justify-center rounded-sm border border-[#e3e5e9] bg-[#f1f3f5] text-[#3a3f45] hover:bg-white";

function formatDate(date: Date) {
  return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
}

function formatTime(date: Date) {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
}

export default function Timeline({
  onFullscreen,
  onToggleToolbar,
}: {
  onFullscreen: () => void;
  onToggleToolbar: () => void;
}) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const week = 7 * 24 * 60 * 60 * 1000;
  const dates = [
    new Date(now.getTime() - 2 * week),
    new Date(now.getTime() - week),
    now,
  ];

  return (
    <div className="relative h-[26px] shrink-0 border-t border-[#e7e8ea] bg-[#fdfdfd]">
      <div
        className="absolute inset-x-0 top-[15px] h-[5px]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(to right, #c9ccd1 0 1px, transparent 1px 11px)",
        }}
      />
      <div className="absolute inset-x-0 top-[15px] h-px bg-[#c9ccd1]" />
      {dates.map((date, index) => (
        <span
          key={index}
          className="absolute top-[1px] -translate-x-1/2 text-[10px] text-[#6f757d]"
          style={{ left: DATE_LEFT[index] }}
          suppressHydrationWarning
        >
          {formatDate(date)}
        </span>
      ))}
      <div
        className="absolute top-0 bottom-0 w-px bg-[#2b7cd3]"
        style={{ left: CURSOR_LEFT }}
      />
      <div
        className="absolute top-[8px] -translate-x-1/2 rounded-sm bg-[#2b7cd3] px-1.5 py-px text-[10px] whitespace-nowrap text-white"
        style={{ left: CURSOR_LEFT }}
        suppressHydrationWarning
      >
        Live {formatTime(now)}
      </div>
      <div className="absolute top-[3px] right-1 flex gap-1">
        <button
          type="button"
          onClick={onFullscreen}
          title="Layar penuh"
          className={CORNER}
        >
          <Maximize2 className="size-3" />
        </button>
        <button
          type="button"
          onClick={onToggleToolbar}
          title="Sembunyikan toolbar"
          className={CORNER}
        >
          <X className="size-3" />
        </button>
      </div>
    </div>
  );
}
