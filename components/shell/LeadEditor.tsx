"use client";

import { Aperture, Plus } from "lucide-react";
import {
  startTransition,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { deleteLeadAction, saveLead } from "@/lib/actions";
import { STATUSES, STATUS_LABEL, type Lead } from "@/lib/leads";
import { EntityGlyph } from "./icons";

const INPUT =
  "h-[22px] w-full rounded-sm border border-[#d7dade] bg-[#fbfbfc] px-1.5 text-[11px] outline-none focus:border-[#3a7bdd]";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-0.5 block text-[10px] text-[#8b929c]">{label}</span>
      {children}
    </label>
  );
}

export default function LeadEditor({
  lead,
  creating,
  onSaved,
  onDone,
  onDeleted,
  onNew,
}: {
  lead: Lead | null;
  creating: boolean;
  onSaved: (id: number) => void;
  onDone: () => void;
  onDeleted: () => void;
  onNew: () => void;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [pending, setPending] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      setPending(true);
      const result = await saveLead(null, formData);
      setPending(false);
      if (result.ok) {
        setError(null);
        onSaved(result.id);
        onDone();
      } else {
        setError(result.error);
      }
    });
  }

  function handleDelete() {
    if (!lead) return;
    if (!window.confirm(`Hapus lead "${lead.name}"?`)) return;
    startTransition(async () => {
      setDeleting(true);
      await deleteLeadAction(lead.id);
      setDeleting(false);
      onDeleted();
    });
  }

  if (collapsed) {
    return (
      <button
        type="button"
        onClick={() => setCollapsed(false)}
        title="Buka panel lead"
        className="absolute top-1.5 left-1.5 flex items-center gap-1.5 rounded-sm border border-[#e3e5e9] bg-white px-2 py-1 text-[11px] shadow-sm"
      >
        <EntityGlyph className="size-3.5 text-[#3f6fd8]" />
        <span className="text-[#5b626b]">›</span>
      </button>
    );
  }

  const active = creating || lead !== null;

  return (
    <div className="absolute top-1.5 left-1.5 w-[360px] text-[11px]">
      <div className="flex h-[26px] items-center gap-2 rounded-sm border border-[#e3e5e9] bg-white px-2 shadow-sm">
        {creating ? (
          <>
            <span className="text-[#5b626b]">Menambah ke</span>
            <Aperture className="size-3.5 text-[#3f6fd8]" />
            <span className="font-medium">Lead Baru</span>
          </>
        ) : lead ? (
          <>
            <span className="shrink-0 text-[#5b626b]">Mengubah</span>
            <EntityGlyph className="size-3.5 shrink-0 text-[#3f6fd8]" />
            <span className="max-w-[100px] truncate font-medium">
              {lead.name}
            </span>
            <span className="shrink-0 rounded-sm bg-[#eef0f4] px-1.5 text-[10px] text-[#5b626b]">
              {STATUS_LABEL[lead.status]}
            </span>
          </>
        ) : (
          <>
            <EntityGlyph className="size-3.5 shrink-0 text-[#3f6fd8]" />
            <span className="text-[#5b626b]">Pilih lead di panel kiri</span>
          </>
        )}
        <span className="flex-1" />
        <button
          type="button"
          onClick={onNew}
          className="flex shrink-0 items-center gap-0.5 font-medium hover:text-[#1d4e9c]"
        >
          <Plus className="size-3" />
          Baru
        </button>
        <button
          type="button"
          onClick={() => setCollapsed(true)}
          title="Kecilkan"
          className="shrink-0 text-[#5b626b] hover:text-[#2c3138]"
        >
          ‹
        </button>
      </div>

      {active && (
        <form
          key={creating ? "new" : `lead-${lead?.id}`}
          onSubmit={handleSubmit}
          className="mt-1 space-y-1.5 rounded-sm border border-[#e3e5e9] bg-white p-2 shadow-sm"
        >
          {lead && !creating && (
            <input type="hidden" name="id" value={lead.id} />
          )}
          <Field label="Nama">
            <input
              name="name"
              defaultValue={creating ? "" : (lead?.name ?? "")}
              required
              className={INPUT}
            />
          </Field>
          <Field label="Telepon">
            <input
              name="phone"
              defaultValue={creating ? "" : (lead?.phone ?? "")}
              className={INPUT}
            />
          </Field>
          <Field label="Alamat">
            <input
              name="address"
              defaultValue={creating ? "" : (lead?.address ?? "")}
              className={INPUT}
            />
          </Field>
          <Field label="Status">
            <select
              name="status"
              defaultValue={creating ? "baru" : (lead?.status ?? "baru")}
              className={INPUT}
            >
              {STATUSES.map((status) => (
                <option key={status.id} value={status.id}>
                  {status.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Catatan">
            <textarea
              name="notes"
              rows={3}
              defaultValue={creating ? "" : (lead?.notes ?? "")}
              className={`${INPUT} h-auto resize-none py-1`}
            />
          </Field>
          {error && <p className="text-[10px] text-[#c0392b]">{error}</p>}
          <div className="flex items-center gap-1.5 pt-0.5">
            <button
              type="submit"
              disabled={pending}
              className="h-[24px] rounded-sm bg-[#2f3540] px-3 font-medium text-white disabled:opacity-60"
            >
              {pending ? "Menyimpan…" : "Simpan"}
            </button>
            {creating && (
              <button
                type="button"
                onClick={onDone}
                className="h-[24px] rounded-sm border border-[#d7dade] px-3"
              >
                Batal
              </button>
            )}
            {lead && !creating && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="ml-auto h-[24px] rounded-sm px-2 text-[#b3403f] hover:bg-[#fbecec] disabled:opacity-60"
              >
                {deleting ? "Menghapus…" : "Hapus"}
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
