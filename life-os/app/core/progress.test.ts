import { test } from "node:test";
import assert from "node:assert/strict";
import {
  closeMilestone,
  confirmedProfit,
  contributionMessage,
  contributionsOnDone,
  milestoneFraction,
  moneyByStatus,
  outcomes,
  pauseDaysInWindow,
  projectProgress,
  regularityIndex,
  taskHours,
  type Habit,
  type Milestone,
  type MoneyEntry,
  type Task,
} from "./progress.ts";

const close = (a: number, b: number) => assert.ok(Math.abs(a - b) < 1e-9, `${a} ≈ ${b}`);

// Пример ВНЖ из ТЗ: веса 10/30/25/20/15.
const vnzh: Milestone[] = [
  { id: "M1", goalId: "G1", weight: 0.1, status: "active" },
  { id: "M2", goalId: "G1", weight: 0.3, status: "active" },
  { id: "M3", goalId: "G1", weight: 0.25, status: "active" },
  { id: "M4", goalId: "G1", weight: 0.2, status: "active" },
  { id: "M5", goalId: "G1", weight: 0.15, status: "active" },
];
const docTask = (id: string, size: Task["size"], status: Task["status"] = "planned"): Task => ({
  id, type: "step", size, status, primary: { goalId: "G1", milestoneId: "M2" },
});
// этап «Документы» суммарным размером 10: M + L + M + S + S
const docs = [docTask("T1", "M"), docTask("T2", "L"), docTask("T3", "M"), docTask("T4", "S"), docTask("T5", "S")];

test("пример из ТЗ: среднее дело в этапе весом 30% и размером 10 даёт +6%", () => {
  const c = contributionsOnDone(docs[0], vnzh, docs);
  close(c.get("G1")!, 0.06);
  const after = docs.map((t) => (t.id === "T1" ? { ...t, status: "done" as const } : t));
  close(projectProgress("G1", vnzh, after), 0.06);
});

test("пустой этап = 0%, деления на ноль нет", () => {
  assert.equal(milestoneFraction(vnzh[4], docs), 0);
  close(projectProgress("G1", vnzh, []), 0);
});

test("добавление дел в этап честно снижает процент", () => {
  const done = docs.map((t) => (t.id === "T1" ? { ...t, status: "done" as const } : t));
  const before = projectProgress("G1", vnzh, done);
  const more = [...done, docTask("T6", "M"), docTask("T7", "M")];
  assert.ok(projectProgress("G1", vnzh, more) < before);
});

test("отменённые дела не входят в знаменатель", () => {
  const withCancelled = [...docs, docTask("T8", "L", "cancelled")];
  close(contributionsOnDone(docs[0], vnzh, withCancelled).get("G1")!, 0.06);
});

test("этап «достигнут другим способом» засчитывается целиком", () => {
  const ms = vnzh.map((m) => (m.id === "M1" ? closeMilestone(m, "achieved_otherwise", "консультация уже была") : m));
  close(projectProgress("G1", ms, docs), 0.1);
});

test("отменённый этап снимает вес с перераспределением", () => {
  const ms = vnzh.map((m) => (m.id === "M5" ? closeMilestone(m, "cancelled", "решение получим без карты") : m));
  const done = docs.map((t) => ({ ...t, status: "done" as const }));
  close(projectProgress("G1", ms, done), 0.3 / 0.85);
});

test("закрыть этап без причины нельзя", () => {
  assert.throws(() => closeMilestone(vnzh[0], "changed", "  "));
});

test("повторяющиеся дела не двигают цели-проекты", () => {
  const habitTask: Task = { id: "H", type: "habit", size: "M", status: "done", primary: { goalId: "G1", milestoneId: "M2" } };
  assert.equal(contributionsOnDone(habitTask, vnzh, [...docs, habitTask]).size, 0);
  close(projectProgress("G1", vnzh, [...docs, habitTask]), 0);
  assert.deepEqual(outcomes(habitTask, vnzh, docs), ["habit"]);
});

test("дело с несколькими целями двигает каждую, время считается один раз", () => {
  const grant: Milestone[] = [{ id: "GM", goalId: "G4", weight: 1, status: "active" }];
  const event: Task = {
    id: "E", type: "step", size: "L", status: "planned",
    primary: { goalId: "G4", milestoneId: "GM" },
    extra: [{ goalId: "G1", milestoneId: "M2" }],
    extraHours: 5,
  };
  const all = [...docs, event];
  const c = contributionsOnDone(event, [...vnzh, ...grant], all);
  close(c.get("G4")!, 1); // единственное дело этапа
  close(c.get("G1")!, (0.3 * 4) / 14);
  assert.equal(taskHours(event), 9);
});

test("исходы: обязательство и дело без вклада", () => {
  const tax: Task = { id: "X", type: "obligation", size: "L", status: "done" };
  const misc: Task = { id: "Y", type: "step", size: "L", status: "done" };
  assert.deepEqual(outcomes(tax, vnzh, []), ["obligation"]);
  assert.deepEqual(outcomes(misc, vnzh, []), ["no_contribution"]);
});

// ---------- регулярность ----------
const habits: Habit[] = [
  { id: "sport", goalId: "G2", norm: 3, period: "week", weight: 1, active: true },
  { id: "water", goalId: "G2", norm: 1, period: "day", weight: 1, active: true },
  { id: "doctor", goalId: "G2", norm: 0, period: "by_appointment", weight: 1, active: true },
];

test("индекс регулярности: среднее выполнение норм, каждая ≤ 100%", () => {
  const idx = regularityIndex("G2", habits, { sport: 12, water: 14 }, [], "2026-11-14");
  close(idx!, (1 + 0.5) / 2); // спорт 12/12 → 100%, вода 14/28 → 50%, врач без записей выпадает
});

test("дни паузы не снижают индекс", () => {
  const pauses = [{ start: "2026-11-01", end: "2026-11-07" }];
  assert.equal(pauseDaysInWindow("water", pauses, "2026-11-14"), 7);
  const idx = regularityIndex("G2", habits, { sport: 9, water: 21 }, pauses, "2026-11-14");
  close(idx!, 1); // 21 активный день: спорт 9/9, вода 21/21
});

test("перекрывающиеся паузы не удваиваются", () => {
  const pauses = [{ start: "2026-11-01", end: "2026-11-07" }, { start: "2026-11-05", end: "2026-11-08" }];
  assert.equal(pauseDaysInWindow("water", pauses, "2026-11-14"), 8);
});

// ---------- деньги ----------
test("подтверждённые, ожидаемые и гипотетические деньги не складываются", () => {
  const e: MoneyEntry[] = [
    { goalId: "G3", amount: 1200, currency: "EUR", rateToBase: 1, status: "confirmed", kind: "income", owner: "personal" },
    { goalId: "G3", amount: 200, currency: "EUR", rateToBase: 1, status: "confirmed", kind: "expense", owner: "personal" },
    { goalId: "G3", amount: 8000, currency: "EUR", rateToBase: 1, status: "expected", kind: "income", owner: "project" },
    { goalId: "G3", amount: 50000, currency: "UAH", rateToBase: 0.022, status: "hypothesis", kind: "income", owner: "personal" },
  ];
  assert.equal(confirmedProfit("G3", e), 1000);
  const by = moneyByStatus("G3", e);
  assert.equal(by.expected, 8000);
  close(by.hypothesis, 1100);
});

test("сообщение бота о вкладе", () => {
  assert.equal(contributionMessage("ВНЖ", 0.28, 0.34), "+6% к плану «ВНЖ» (28% → 34%)");
});
