// Kontrak API kolektor (backend di PR terpisah, lihat issue #18).
export type CollectResult = {
  id: number;
  name: string;
  phone: string | null;
  address: string | null;
  category: string | null;
  website: string | null;
  lat: number | null;
  lng: number | null;
};

export type CollectJob = {
  id: number;
  query: string;
  area?: string | null;
  status: string;
  total_found: number;
  created_at: string;
};

export type CollectJobResponse = { job: CollectJob; results: CollectResult[] };
export type CollectJobsResponse = { jobs: CollectJob[] };
export type ImportResponse = { imported: number; skipped: number };
