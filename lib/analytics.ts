import { getDb } from "./db";
import { STATUS_IDS, type LeadStatus } from "./leads";

export type FunnelStatus = Extract<LeadStatus, "baru" | "follow-up" | "deal">;

export type Summary = {
  total: number;
  byStatus: Record<LeadStatus, number>;
  byCategory: { category: string | null; count: number }[];
};

export type WeeklyTrendPoint = {
  week_start: string;
  count: number;
};

export type Funnel = Record<FunnelStatus, number>;

const FUNNEL_STATUSES: FunnelStatus[] = ["baru", "follow-up", "deal"];

const DEFAULT_WEEKS = 8;
const MAX_WEEKS = 104;

type GroupRow = { key: string | null; count: number };

function groupCounts(sql: string, values: (string | number)[] = []): GroupRow[] {
  return getDb()
    .prepare(sql)
    .all(...values)
    .map((row) => {
      const plain = row as { key: string | null; count: number };
      return { key: plain.key, count: plain.count };
    });
}

export function getSummary(): Summary {
  const totalRow = getDb()
    .prepare("SELECT COUNT(*) AS total FROM leads")
    .get() as { total: number } | undefined;
  const total = totalRow?.total ?? 0;

  const byStatus = Object.fromEntries(
    STATUS_IDS.map((status) => [status, 0]),
  ) as Record<LeadStatus, number>;
  for (const row of groupCounts(
    "SELECT status AS key, COUNT(*) AS count FROM leads GROUP BY status",
  )) {
    if (row.key !== null && row.key in byStatus) {
      byStatus[row.key as LeadStatus] = row.count;
    }
  }

  // null category is kept as its own bucket so callers can label it.
  const byCategory = groupCounts(
    "SELECT category AS key, COUNT(*) AS count FROM leads GROUP BY category ORDER BY count DESC, key ASC",
  ).map((row) => ({ category: row.key, count: row.count }));

  return { total, byStatus, byCategory };
}

function clampWeeks(weeks: number | undefined): number {
  if (typeof weeks !== "number" || !Number.isFinite(weeks)) return DEFAULT_WEEKS;
  return Math.min(Math.max(Math.floor(weeks), 1), MAX_WEEKS);
}

// Monday-aligned week start in UTC, matching date(created_at, ...) below.
function startOfWeekUTC(date: Date): string {
  const start = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
  start.setUTCDate(start.getUTCDate() - ((start.getUTCDay() + 6) % 7));
  return start.toISOString().slice(0, 10);
}

export function getWeeklyTrend(weeks?: number): WeeklyTrendPoint[] {
  const count = clampWeeks(weeks);
  const currentWeek = new Date();
  const points: WeeklyTrendPoint[] = [];

  for (let index = count - 1; index >= 0; index -= 1) {
    const start = new Date(currentWeek);
    start.setUTCDate(start.getUTCDate() - index * 7);
    points.push({ week_start: startOfWeekUTC(start), count: 0 });
  }

  const indexByWeek = new Map(
    points.map((point, index) => [point.week_start, index]),
  );

  const rows = groupCounts(
    `SELECT date(created_at, '-' || ((strftime('%w', created_at) + 6) % 7) || ' days') AS key,
            COUNT(*) AS count
     FROM leads
     WHERE created_at >= ?
     GROUP BY key
     ORDER BY key ASC`,
    [points[0].week_start],
  );

  for (const row of rows) {
    if (row.key === null) continue;
    const index = indexByWeek.get(row.key);
    if (index !== undefined) points[index].count = row.count;
  }

  return points;
}

export function getFunnel(): Funnel {
  const funnel = Object.fromEntries(
    FUNNEL_STATUSES.map((status) => [status, 0]),
  ) as Funnel;

  for (const row of groupCounts(
    "SELECT status AS key, COUNT(*) AS count FROM leads WHERE status IN (?, ?, ?) GROUP BY status",
    FUNNEL_STATUSES,
  )) {
    if (row.key !== null && row.key in funnel) {
      funnel[row.key as FunnelStatus] = row.count;
    }
  }

  return funnel;
}
