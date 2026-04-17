"use client";

import { useMemo } from "react";

const MONTHS_HU = [
  "Január", "Február", "Március", "Április", "Május", "Június",
  "Július", "Augusztus", "Szeptember", "Október", "November", "December",
];
const WEEKDAYS_HU = ["H", "K", "Sze", "Cs", "P", "Szo", "V"];

function toISODate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

type DayInfo = { iso: string; count: number; users: string[]; mine: boolean };

export default function YearCalendar({
  year = 2026,
  availabilityByDay,
  currentUser,
  onToggle,
  totalUsers,
  highlightedDays = [],
}: {
  year?: number;
  availabilityByDay: Map<string, string[]>;
  currentUser: string;
  onToggle: (iso: string) => void;
  totalUsers: number;
  highlightedDays?: string[];
}) {
  const months = useMemo(() => {
    const arr: { month: number; weeks: (Date | null)[][] }[] = [];
    for (let m = 0; m < 12; m++) {
      const first = new Date(year, m, 1);
      const last = new Date(year, m + 1, 0);
      // Monday-first offset: getDay() 0=Sun,1=Mon,...; we want 0=Mon..6=Sun
      const startOffset = (first.getDay() + 6) % 7;
      const weeks: (Date | null)[][] = [];
      let week: (Date | null)[] = new Array(startOffset).fill(null);
      for (let d = 1; d <= last.getDate(); d++) {
        week.push(new Date(year, m, d));
        if (week.length === 7) {
          weeks.push(week);
          week = [];
        }
      }
      if (week.length > 0) {
        while (week.length < 7) week.push(null);
        weeks.push(week);
      }
      arr.push({ month: m, weeks });
    }
    return arr;
  }, [year]);

  const hlSet = useMemo(() => new Set(highlightedDays), [highlightedDays]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {months.map(({ month, weeks }) => (
        <div
          key={month}
          className="bg-white rounded-xl border border-neutral-200 p-4"
        >
          <h3 className="font-semibold mb-3 text-center">
            {MONTHS_HU[month]} {year}
          </h3>
          <div className="grid grid-cols-7 gap-1 text-xs text-neutral-500 mb-1">
            {WEEKDAYS_HU.map((w) => (
              <div key={w} className="text-center py-1 font-medium">
                {w}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {weeks.flat().map((d, i) => {
              if (!d) return <div key={i} />;
              const iso = toISODate(d);
              const users = availabilityByDay.get(iso) || [];
              const count = users.length;
              const mine = users.includes(currentUser);
              const ratio = totalUsers > 0 ? count / totalUsers : 0;
              const highlighted = hlSet.has(iso);

              let bg = "bg-white hover:bg-neutral-100 border-neutral-200";
              if (count > 0) {
                if (ratio >= 1) bg = "bg-emerald-500 text-white border-emerald-600 hover:bg-emerald-600";
                else if (ratio >= 0.66) bg = "bg-emerald-300 border-emerald-400 hover:bg-emerald-400";
                else if (ratio >= 0.34) bg = "bg-emerald-100 border-emerald-200 hover:bg-emerald-200";
                else bg = "bg-emerald-50 border-emerald-100 hover:bg-emerald-100";
              }

              return (
                <button
                  key={iso}
                  onClick={() => onToggle(iso)}
                  title={
                    count > 0
                      ? `${count} fő: ${users.join(", ")}`
                      : "Senki sem jelezte"
                  }
                  className={`calendar-day ${bg} ${
                    mine ? "ring-2 ring-brand-600 ring-offset-1" : ""
                  } ${highlighted ? "outline outline-2 outline-yellow-400" : ""}`}
                >
                  <span className="font-medium leading-none">{d.getDate()}</span>
                  {count > 0 && (
                    <span className="text-[10px] leading-none mt-0.5 opacity-80">
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
