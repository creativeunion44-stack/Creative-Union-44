// AI Life & Growth OS — расчёты прогресса (ТЗ v3.2).
// Единственное место, где живут формулы: его используют Edge Functions и тесты.
// Во фронтенде расчётов нет.

export type Size = "S" | "M" | "L";
export type TaskType = "step" | "habit" | "appointment" | "obligation" | "purchase";
export type TaskStatus = "planned" | "done" | "waiting" | "cancelled";
export type MilestoneStatus = "active" | "achieved_otherwise" | "changed" | "cancelled";
export type GoalType = "project" | "state" | "result" | "obligation";

export interface Milestone {
  id: string;
  goalId: string;
  weight: number; // доля 0..1
  status: MilestoneStatus;
  closeReason?: string;
}

export interface GoalLink {
  goalId: string;
  milestoneId?: string; // v3.2: этап есть и у дополнительной цели
}

export interface Task {
  id: string;
  type: TaskType;
  size: Size;
  status: TaskStatus;
  primary?: GoalLink;
  extra?: GoalLink[]; // до трёх
  habitId?: string;
  extraHours?: number; // «заняло больше»
}

export const POINTS: Record<Size, number> = { S: 1, M: 2, L: 4 };
export const HOURS: Record<Size, number> = { S: 0.25, M: 1, L: 4 };
export const MAX_EXTRA_GOALS = 3;

/** Все связи дела с этапами (основная + дополнительные). */
function links(t: Task): GoalLink[] {
  return [t.primary, ...(t.extra ?? []).slice(0, MAX_EXTRA_GOALS)].filter(
    (l): l is GoalLink => l !== undefined,
  );
}

/** Участвует ли дело в процентах этапа: привычки и отменённые дела — нет. */
function countsForMilestone(t: Task, milestoneId: string): boolean {
  return t.type !== "habit" && t.status !== "cancelled" && links(t).some((l) => l.milestoneId === milestoneId);
}

export function milestoneTotals(milestoneId: string, tasks: Task[]): { total: number; done: number } {
  let total = 0;
  let done = 0;
  for (const t of tasks) {
    if (!countsForMilestone(t, milestoneId)) continue;
    total += POINTS[t.size];
    if (t.status === "done") done += POINTS[t.size];
  }
  return { total, done };
}

/** Доля выполнения этапа 0..1. Пустой этап = 0 (v3.2), «достигнут другим способом» = 1. */
export function milestoneFraction(m: Milestone, tasks: Task[]): number {
  if (m.status === "achieved_otherwise") return 1;
  const { total, done } = milestoneTotals(m.id, tasks);
  return total === 0 ? 0 : done / total;
}

/** Вес этапа после перераспределения: вес отменённых этапов делится между остальными. */
export function effectiveWeight(m: Milestone, all: Milestone[]): number {
  if (m.status === "cancelled") return 0;
  const sum = all
    .filter((x) => x.goalId === m.goalId && x.status !== "cancelled")
    .reduce((s, x) => s + x.weight, 0);
  return sum === 0 ? 0 : m.weight / sum;
}

/** Ручное закрытие этапа без причины невозможно. */
export function closeMilestone(m: Milestone, status: Exclude<MilestoneStatus, "active">, reason: string): Milestone {
  if (!reason || !reason.trim()) throw new Error("Закрыть этап можно только с причиной");
  return { ...m, status, closeReason: reason.trim() };
}

/** «План выполнен на X%» для цели-проекта, 0..1. */
export function projectProgress(goalId: string, milestones: Milestone[], tasks: Task[]): number {
  const own = milestones.filter((m) => m.goalId === goalId);
  return own.reduce((s, m) => s + effectiveWeight(m, own) * milestoneFraction(m, tasks), 0);
}

/**
 * Вклад сделанного дела в каждую связанную цель — считается в момент отметки
 * и сохраняется (таблица contributions), прошлые точки не переписываются.
 */
export function contributionsOnDone(task: Task, milestones: Milestone[], tasks: Task[]): Map<string, number> {
  const result = new Map<string, number>();
  if (task.type === "habit") return result; // повторяющиеся дела не двигают цели-проекты
  const after = tasks.map((t) => (t.id === task.id ? { ...t, status: "done" as const } : t));
  for (const l of links(task)) {
    if (!l.milestoneId) continue;
    const m = milestones.find((x) => x.id === l.milestoneId);
    if (!m || m.status !== "active") continue;
    const { total } = milestoneTotals(m.id, after);
    if (total === 0) continue;
    const own = milestones.filter((x) => x.goalId === m.goalId);
    const delta = (effectiveWeight(m, own) * POINTS[task.size]) / total;
    result.set(m.goalId, (result.get(m.goalId) ?? 0) + delta);
  }
  return result;
}

/** Часы дела: только по основной цели, поэтому время не удваивается. */
export function taskHours(t: Task): number {
  return HOURS[t.size] + (t.extraHours ?? 0);
}

export type Outcome = "step" | "habit" | "result_candidate" | "obligation" | "no_contribution";

/** Исходы сделанного дела (одно дело может дать несколько). */
export function outcomes(t: Task, milestones: Milestone[], tasks: Task[]): Outcome[] {
  if (t.status !== "done") return [];
  if (t.type === "obligation") return ["obligation"];
  if (t.type === "habit" || t.habitId) return ["habit"];
  const out: Outcome[] = [];
  if (contributionsOnDone(t, milestones, tasks).size > 0) out.push("step");
  if (t.primary && !t.primary.milestoneId) out.push("result_candidate");
  return out.length ? out : ["no_contribution"];
}

// ---------- Цель-состояние: индекс регулярности ----------

export type Period = "day" | "week" | "month" | "by_appointment";
export interface Habit {
  id: string;
  goalId: string;
  norm: number;
  period: Period;
  weight: number;
  active: boolean;
}
export interface Pause {
  start: string; // YYYY-MM-DD включительно
  end: string;
  habitId?: string; // пусто = все привычки
}

export const WINDOW_DAYS = 28;
const PERIOD_DAYS: Record<Exclude<Period, "by_appointment">, number> = { day: 1, week: 7, month: 30.4 };
const DAY = 86_400_000;
const d = (s: string) => Date.parse(s + "T00:00:00Z");

/** Дни паузы в окне [today-27; today] — уникальные дни, перекрытия не удваиваются. */
export function pauseDaysInWindow(habitId: string, pauses: Pause[], today: string): number {
  const end = d(today);
  const start = end - (WINDOW_DAYS - 1) * DAY;
  const days = new Set<number>();
  for (const p of pauses) {
    if (p.habitId && p.habitId !== habitId) continue;
    for (let t = Math.max(d(p.start), start); t <= Math.min(d(p.end), end); t += DAY) days.add(t);
  }
  return days.size;
}

/** Ожидаемое число выполнений за окно (v3.2). Для «по записи» norm = записей в окне. */
export function expectedInWindow(h: Habit, activeDays: number): number {
  if (h.period === "by_appointment") return h.norm;
  return (h.norm * activeDays) / PERIOD_DAYS[h.period];
}

/** Индекс регулярности 0..1 или null, если считать не из чего. */
export function regularityIndex(
  goalId: string,
  habits: Habit[],
  doneCounts: Record<string, number>,
  pauses: Pause[],
  today: string,
): number | null {
  let num = 0;
  let den = 0;
  for (const h of habits) {
    if (h.goalId !== goalId || !h.active) continue;
    const active = WINDOW_DAYS - pauseDaysInWindow(h.id, pauses, today);
    const expected = expectedInWindow(h, active);
    if (expected <= 0) continue; // выпадает из индекса, а не даёт 0%
    num += h.weight * Math.min(1, (doneCounts[h.id] ?? 0) / expected);
    den += h.weight;
  }
  return den === 0 ? null : num / den;
}

// ---------- Деньги ----------

export type MoneyStatus = "confirmed" | "expected" | "hypothesis";
export interface MoneyEntry {
  goalId: string;
  amount: number;
  currency: string;
  rateToBase: number; // курс на дату записи
  status: MoneyStatus;
  kind: "income" | "expense";
  owner: "personal" | "project";
}

/** Итоги по статусам — никогда не складываются между собой. Значения ≈ в базовой валюте. */
export function moneyByStatus(goalId: string, entries: MoneyEntry[]): Record<MoneyStatus, number> {
  const r: Record<MoneyStatus, number> = { confirmed: 0, expected: 0, hypothesis: 0 };
  for (const e of entries) {
    if (e.goalId !== goalId) continue;
    const v = e.amount * e.rateToBase;
    r[e.status] += e.kind === "income" ? v : -v;
  }
  return r;
}

/** Прибыль цели = подтверждённые доходы − подтверждённые расходы. */
export function confirmedProfit(goalId: string, entries: MoneyEntry[]): number {
  return moneyByStatus(goalId, entries).confirmed;
}

// ---------- Подача ----------

export const fmtPct = (x: number) => `${Math.round(x * 100)}%`;
export function contributionMessage(goalName: string, before: number, after: number): string {
  const delta = Math.round((after - before) * 100);
  return `+${delta}% к плану «${goalName}» (${fmtPct(before)} → ${fmtPct(after)})`;
}
