import { STATUSES, type Lead, type LeadStatus } from "@/lib/leads";

const WEEKS = 12;

const STATUS_COLOR: Record<LeadStatus, string> = {
  baru: "#3f6fd8",
  "follow-up": "#e8a13c",
  deal: "#0e7f51",
  arsip: "#8b929c",
};

const FUNNEL: LeadStatus[] = ["baru", "follow-up", "deal"];

// created_at SQLite "YYYY-MM-DD HH:MM:SS" (UTC)
function parseDate(value: string): Date {
  return new Date(value.includes("T") ? value : `${value.replace(" ", "T")}Z`);
}

function startOfWeek(date: Date): Date {
  const start = new Date(date);
  start.setUTCHours(0, 0, 0, 0);
  start.setUTCDate(start.getUTCDate() - ((start.getUTCDay() + 6) % 7));
  return start;
}

const dateKey = (date: Date) => date.toISOString().slice(0, 10);

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: string;
}) {
  return (
    <div className="rounded-sm border border-[#dfe2e6] bg-white p-2">
      <div className="text-[10px] uppercase tracking-wide text-[#8b929c]">
        {label}
      </div>
      <div
        className="mt-1 text-[20px] font-semibold"
        style={{ color: accent ?? "#2c3138" }}
      >
        {value}
      </div>
    </div>
  );
}

function WeekBars({ leads }: { leads: Lead[] }) {
  const currentWeek = startOfWeek(new Date());
  const weeks = Array.from({ length: WEEKS }, (_, index) => {
    const start = new Date(currentWeek);
    start.setUTCDate(start.getUTCDate() - (WEEKS - 1 - index) * 7);
    return { start, count: 0 };
  });
  const indexByKey = new Map(
    weeks.map((week, index) => [dateKey(week.start), index]),
  );

  for (const lead of leads) {
    const index = indexByKey.get(
      dateKey(startOfWeek(parseDate(lead.created_at))),
    );
    if (index !== undefined) weeks[index].count += 1;
  }

  const max = Math.max(1, ...weeks.map((week) => week.count));

  return (
    <div className="flex items-end gap-1">
      {weeks.map((week) => {
        const date = `${week.start.getUTCDate()}/${week.start.getUTCMonth() + 1}`;
        const height = `${Math.round((week.count / max) * 100)}%`;
        return (
          <div
            key={dateKey(week.start)}
            className="flex flex-1 flex-col items-center"
          >
            <span className="mb-0.5 h-3 text-[9px] text-[#8b929c]">
              {week.count || ""}
            </span>
            <div
              className="flex h-[96px] w-full items-end"
              title={`Minggu ${date} — ${week.count} lead`}
            >
              <div
                className="w-full rounded-t-sm bg-[#3f6fd8]"
                style={{ height, minHeight: week.count ? "2px" : 0 }}
              />
            </div>
            <span className="mt-1 text-[9px] text-[#8b929c]">{date}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function Metrics({ leads }: { leads: Lead[] }) {
  const total = leads.length;
  const counts = Object.fromEntries(
    STATUSES.map((status) => [
      status.id,
      leads.filter((lead) => lead.status === status.id).length,
    ]),
  ) as Record<LeadStatus, number>;

  return (
    <div className="mt-3 space-y-3">
      <div>
        <h1 className="text-[15px] font-semibold">Metrik prospek</h1>
        <p className="text-[11px] text-[#7d848d]">
          Ringkasan {total} lead dari basis data lokal.
        </p>
      </div>

      <section>
        <h2 className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-[#5b626b]">
          Ringkasan status
        </h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          <StatCard label="Total lead" value={total} />
          {STATUSES.map((status) => (
            <StatCard
              key={status.id}
              label={status.label}
              value={counts[status.id]}
              accent={STATUS_COLOR[status.id]}
            />
          ))}
        </div>
      </section>

      <section className="rounded-sm border border-[#dfe2e6] bg-white p-3">
        <h2 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-[#5b626b]">
          Funnel konversi
        </h2>
        {/* shortcut: funnel dari status saat ini (tanpa riwayat), tingkatkan saat event/timeline tersedia */}
        <div className="space-y-1.5">
          {FUNNEL.map((status) => {
            const count = counts[status];
            const percent = total ? Math.round((count / total) * 100) : 0;
            const label =
              STATUSES.find((item) => item.id === status)?.label ?? status;
            return (
              <div key={status} className="flex items-center gap-2">
                <span className="w-[68px] shrink-0 text-[11px] text-[#5b626b]">
                  {label}
                </span>
                <div className="h-[16px] flex-1 overflow-hidden rounded-sm bg-[#eef0f4]">
                  <div
                    className="h-full rounded-sm"
                    style={{
                      width: `${percent}%`,
                      backgroundColor: STATUS_COLOR[status],
                    }}
                  />
                </div>
                <span className="w-[76px] shrink-0 text-right text-[11px] tabular-nums text-[#5b626b]">
                  {count} · {percent}%
                </span>
              </div>
            );
          })}
        </div>
        <p className="mt-1.5 text-[10px] text-[#9aa0aa]">
          Baru → Follow-up → Deal, dihitung dari status terkini.
        </p>
      </section>

      <section className="rounded-sm border border-[#dfe2e6] bg-white p-3">
        <h2 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-[#5b626b]">
          Tren mingguan ({WEEKS} minggu terakhir)
        </h2>
        <WeekBars leads={leads} />
      </section>
    </div>
  );
}
