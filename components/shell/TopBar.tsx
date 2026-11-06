"use client";

import { ChevronDown, Maximize2, Shield, Star } from "lucide-react";
import { useState, useSyncExternalStore } from "react";
import { LogoMark } from "./icons";

const MENU = ["File", "View", "Related", "Support", "✓ Saved"];

// status "tersimpan" disimpan di localStorage, dibaca lewat store kecil
let savedState: boolean | null = null;
const savedListeners = new Set<() => void>();

function subscribeSaved(callback: () => void) {
  savedListeners.add(callback);
  return () => savedListeners.delete(callback);
}

function getSaved() {
  savedState ??= window.localStorage.getItem("ls:saved") === "1";
  return savedState;
}

function setSaved(value: boolean) {
  savedState = value;
  window.localStorage.setItem("ls:saved", value ? "1" : "0");
  savedListeners.forEach((callback) => callback());
}

export default function TopBar({
  onFullscreen,
}: {
  onFullscreen: () => void;
}) {
  const saved = useSyncExternalStore(subscribeSaved, getSaved, () => false);
  const [copied, setCopied] = useState(false);

  function toggleSaved() {
    setSaved(!saved);
  }

  async function share() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // clipboard bisa ditolak browser; abaikan
    }
  }

  return (
    <header className="flex h-[20px] shrink-0 items-center gap-3 bg-[#15181d] px-2 text-[11px] text-[#e8eaed]">
      <LogoMark className="size-3.5 shrink-0 text-white" />
      <nav className="hidden items-center gap-3 text-[#b6bcc4] md:flex">
        {MENU.map((item) => (
          <span key={item} className="cursor-default hover:text-white">
            {item}
          </span>
        ))}
      </nav>
      <div className="flex flex-1 items-center justify-center gap-1.5">
        <span className="size-3 shrink-0 rounded-[2px] bg-[#2b7cd3]" />
        <span className="font-medium">Leads Surveillance</span>
        <button
          type="button"
          onClick={toggleSaved}
          title={saved ? "Hapus dari tersimpan" : "Simpan"}
          className={saved ? "text-[#e8a13c]" : "text-[#b6bcc4] hover:text-white"}
        >
          <Star className="size-3" fill={saved ? "currentColor" : "none"} />
        </button>
        <ChevronDown className="size-3 text-[#b6bcc4]" />
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <button
          type="button"
          onClick={share}
          className="text-[#5e9cd6] hover:text-[#8ab8e6]"
        >
          {copied ? "Tersalin" : "Share"}
        </button>
        <span className="flex items-center gap-1.5 border-l border-[#2a2e35] pl-3">
          <Shield className="size-3.5 text-[#9aa0a6]" />
          <span className="font-semibold tracking-wide">MTS//MNF</span>
        </span>
        <span className="border-l border-[#2a2e35] pl-3">
          <button
            type="button"
            onClick={onFullscreen}
            title="Layar penuh"
            className="text-[#e8eaed] hover:text-white"
          >
            <Maximize2 className="size-3" />
          </button>
        </span>
      </div>
    </header>
  );
}
