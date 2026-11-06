export type LeadStatus = "baru" | "follow-up" | "deal" | "arsip";

export type Lead = {
  id: number;
  name: string;
  phone: string | null;
  address: string | null;
  notes: string | null;
  status: LeadStatus;
  category: string | null;
  tags: string | null;
  lat: number | null;
  lng: number | null;
  created_at: string;
  updated_at: string | null;
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

export const STATUS_IDS: LeadStatus[] = STATUSES.map((status) => status.id);

export function isLeadStatus(value: unknown): value is LeadStatus {
  return typeof value === "string" && STATUS_IDS.includes(value as LeadStatus);
}
