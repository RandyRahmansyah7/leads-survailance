export type LeadStatus = "baru" | "follow-up" | "deal" | "arsip";

export type Lead = {
  id: number;
  name: string;
  phone: string | null;
  address: string | null;
  notes: string | null;
  status: LeadStatus;
  created_at: string;
};

export const STATUSES: { id: LeadStatus; label: string }[] = [
  { id: "baru", label: "Baru" },
  { id: "follow-up", label: "Follow-up" },
  { id: "deal", label: "Deal" },
  { id: "arsip", label: "Arsip" },
];

export const STATUS_LABEL = Object.fromEntries(
  STATUSES.map((status) => [status.id, status.label]),
) as Record<LeadStatus, string>;
