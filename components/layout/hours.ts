import type { BusinessHour } from "@/types/settings";
import { WEEKDAY_LABELS } from "@/lib/constants";

const SHORT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function hhmm(value: string | null): string {
  if (!value) return "";
  const [h = "00", m = "00"] = value.split(":");
  return m === "00" ? `${Number(h)}h` : `${Number(h)}h${m}`;
}

/** Linhas por dia: "Segunda-feira: 7h–18h" (apenas dias cadastrados) */
export function formatHoursByDay(hours: BusinessHour[]): { day: string; value: string }[] {
  const byDay = new Map<number, BusinessHour[]>();
  for (const h of hours) byDay.set(h.dayOfWeek, [...(byDay.get(h.dayOfWeek) ?? []), h]);
  return [1, 2, 3, 4, 5, 6, 0]
    .filter((d) => byDay.has(d))
    .map((d) => {
      const entries = byDay.get(d)!;
      const value = entries.some((e) => e.isClosed)
        ? "Fechado"
        : entries.map((e) => `${hhmm(e.opensAt)}–${hhmm(e.closesAt)}`).join(", ");
      return { day: WEEKDAY_LABELS[d]!, value };
    });
}

/** Resumo curto: "Seg–Sex 7h–18h · Sáb 7h–12h" (vazio se não houver horário cadastrado) */
export function summarizeHours(hours: BusinessHour[]): string | null {
  if (hours.length === 0) return null;
  const rows = [1, 2, 3, 4, 5, 6, 0].map((d) => {
    const entries = hours.filter((h) => h.dayOfWeek === d);
    if (entries.length === 0 || entries.some((e) => e.isClosed)) return { d, value: null };
    return { d, value: entries.map((e) => `${hhmm(e.opensAt)}–${hhmm(e.closesAt)}`).join(", ") };
  });
  const groups: { start: number; end: number; value: string }[] = [];
  for (const row of rows) {
    if (!row.value) continue;
    const last = groups[groups.length - 1];
    if (last && last.value === row.value && (last.end + 1) % 7 === row.d) last.end = row.d;
    else groups.push({ start: row.d, end: row.d, value: row.value });
  }
  if (groups.length === 0) return null;
  return groups
    .map((g) => `${g.start === g.end ? SHORT[g.start] : `${SHORT[g.start]}–${SHORT[g.end]}`} ${g.value}`)
    .join(" · ");
}
