import { Temporal } from "temporal-polyfill";
import type { Phase } from "../types";
import { toPlainDate } from "./shared";
import type {
  ConfigV2,
  Cycle,
  PredictionDay,
} from "@repo/config-schema/config-v2.schema";

/** The dates of the days as "2025-01-31" strings, each once */
const dateSet = (days: PredictionDay[] | undefined): Set<string> => {
  return new Set(
    (days ?? []).map((day) => {
      return toPlainDate(day.date).toString();
    }),
  );
};

/** Day offsets from today, negative for past days */
const offsets = (
  days: PredictionDay[] | undefined,
  today: Temporal.PlainDate,
): number[] => {
  return (days ?? []).map((day) => {
    return today.until(toPlainDate(day.date), { largestUnit: "days" }).days;
  });
};

/** The smallest offset that is not in the past, undefined when all are past */
const nearest = (counts: number[]): number | undefined => {
  const upcoming = counts.filter((count) => {
    return count >= 0;
  });
  return upcoming.length > 0 ? Math.min(...upcoming) : undefined;
};

/**
 * Which day of a period today is, from the offsets of its predicted days.
 * Predicted days that follow each other form one period, so with days on Jan
 * 8, 9, 10 and 11 and today on Jan 10 the result is 3. Undefined when today
 * is not a predicted day
 */
const dayOfPeriod = (offsets: number[]): number | undefined => {
  const days = new Set(offsets);
  if (!days.has(0)) {
    return undefined;
  }
  let number = 1;
  while (days.has(-number)) {
    number += 1;
  }
  return number;
};

/** The UTC date the latest logged cycle started on, undefined without cycles */
const lastStart = (cycles: Cycle[]): Temporal.PlainDate | undefined => {
  const last = cycles.at(-1);
  return last ? toPlainDate(last.start_date) : undefined;
};

/**
 * The first predicted period start after the given date. Predicted days that
 * follow each other form one period, and its start is the first of them
 */
const nextStart = (
  days: PredictionDay[] | undefined,
  after: Temporal.PlainDate,
): Temporal.PlainDate | undefined => {
  const dates = dateSet(days);
  const starts = [...dates]
    .map((date) => {
      return Temporal.PlainDate.from(date);
    })
    .filter((date) => {
      return (
        Temporal.PlainDate.compare(date, after) > 0 &&
        !dates.has(date.subtract({ days: 1 }).toString())
      );
    })
    .sort((a, b) => {
      return Temporal.PlainDate.compare(a, b);
    });
  return starts[0];
};

/**
 * How many days the period is late. The next period is predicted to start on
 * the first predicted day after the last logged cycle began. If that day is
 * before today and no new cycle was logged, the period is late by the days
 * since then. Undefined when it is not late
 */
const daysLate = (
  days: PredictionDay[] | undefined,
  cycles: Cycle[],
  today: Temporal.PlainDate = Temporal.Now.plainDateISO("UTC"),
): number | undefined => {
  const last = lastStart(cycles);
  if (!last) {
    return undefined;
  }
  const next = nextStart(days, last);
  if (!next) {
    return undefined;
  }
  const late = next.until(today, { largestUnit: "days" }).days;
  return late >= 1 ? late : undefined;
};

/**
 * The phase of every day of a cycle that lasts `length` days. The first days
 * of the logged period are menstrual, the ovulation days are ovulation, the
 * days before the first of them are follicular and the days after luteal. The
 * ovulation days come from the ovulation algorithm, the days of other cycles
 * among them are ignored
 */
export const phasesOfCycle = (
  cycle: Cycle,
  length: number,
  ovulationDays: PredictionDay[] | undefined,
): Phase[] => {
  const start = toPlainDate(cycle.start_date);
  const ovulation = dateSet(ovulationDays);
  const first = [...ovulation].sort()[0];
  return Array.from({ length }, (_, index): Phase => {
    const date = start.add({ days: index }).toString();
    if (index < cycle.period_length) {
      return "menstrual";
    }
    if (ovulation.has(date)) {
      return "ovulation";
    }
    return first === undefined || date < first ? "follicular" : "luteal";
  });
};

/**
 * The phase of every day of the current cycle, from the day the last logged
 * cycle started to the day before the next predicted period. Empty when there
 * is no cycle or no predicted next period
 */
export const phasesByDay = (
  predictions: ConfigV2["predictions"],
  cycles: Cycle[],
): Phase[] => {
  const last = cycles.at(-1);
  const start = lastStart(cycles);
  if (!last || !start) {
    return [];
  }
  const end = nextStart(predictions.menstruation?.days, start);
  if (!end) {
    return [];
  }
  const length = start.until(end, { largestUnit: "days" }).days;
  return phasesOfCycle(last, length, predictions.ovulation?.days);
};

/**
 * How many days the phase of today lasts, today included, so 1 on its last
 * day. Undefined when today is outside of the current cycle, for example when
 * the period is late
 */
export const daysLeftInPhase = (
  predictions: ConfigV2["predictions"],
  cycles: Cycle[],
  today: Temporal.PlainDate = Temporal.Now.plainDateISO("UTC"),
): number | undefined => {
  const start = lastStart(cycles);
  if (!start) {
    return undefined;
  }
  const phases = phasesByDay(predictions, cycles);
  const index = start.until(today, { largestUnit: "days" }).days;
  const phase = phases[index];
  if (phase === undefined) {
    return undefined;
  }
  let end = index;
  while (phases[end + 1] === phase) {
    end += 1;
  }
  return end - index + 1;
};

/**
 * How many days until the given phase starts, 1 for tomorrow. A phase that
 * is not ahead in the current cycle starts in the next one, which is taken to
 * have the same phases. When the period is late the predicted next cycle is
 * moved to start today, so the delay is added to every predicted date.
 * Undefined when there is nothing to count from or the phase is not in the
 * cycle
 */
export const daysUntilPhase = (
  predictions: ConfigV2["predictions"],
  cycles: Cycle[],
  phase: Phase,
  today: Temporal.PlainDate = Temporal.Now.plainDateISO("UTC"),
): number | undefined => {
  const start = lastStart(cycles);
  const last = cycles.at(-1);
  if (!start || !last) {
    return undefined;
  }
  const phases = phasesByDay(predictions, cycles);
  const index = start.until(today, { largestUnit: "days" }).days;
  if (phases[index] !== undefined) {
    const ahead = phases.indexOf(phase, index + 1);
    if (ahead !== -1) {
      return ahead - index;
    }
    const first = phases.indexOf(phase);
    return first === -1 ? undefined : phases.length + first - index;
  }
  // The predicted period has not been logged, the next cycle starts today
  const next = nextStart(predictions.menstruation?.days, start);
  const after = next && nextStart(predictions.menstruation?.days, next);
  if (!next || !after || Temporal.PlainDate.compare(next, today) > 0) {
    return undefined;
  }
  const upcoming = phasesOfCycle(
    { ...last, start_date: `${next.toString()}T00:00:00.000Z` },
    next.until(after, { largestUnit: "days" }).days,
    (predictions.ovulation?.days ?? []).filter((day) => {
      const date = toPlainDate(day.date);
      return (
        Temporal.PlainDate.compare(date, next) >= 0 &&
        Temporal.PlainDate.compare(date, after) < 0
      );
    }),
  );
  const first = upcoming.indexOf(phase);
  return first === -1 ? undefined : first;
};

export type PeriodStatus = {
  /** The phase today falls in */
  phase: Phase;
  /** How many days the period is late, undefined when it is not */
  late: number | undefined;
  /** Which day of the predicted period today is, undefined outside of it */
  dayOfPeriod: number | undefined;
  /** Days to the nearest predicted period day, 0 when it is today */
  daysUntilPeriod: number | undefined;
};

/**
 * Where today is in the cycle. A day of the logged period is menstrual and a
 * late period counts as luteal. Otherwise an ovulation day is ovulation, the
 * days before the next ovulation are follicular and the days after the last
 * one are luteal. Follicular is the default
 */
export const periodStatus = (
  predictions: ConfigV2["predictions"],
  cycles: Cycle[],
  today: Temporal.PlainDate = Temporal.Now.plainDateISO("UTC"),
): PeriodStatus => {
  const menstruation = offsets(predictions.menstruation?.days, today);
  const ovulation = offsets(predictions.ovulation?.days, today);
  const day = dayOfPeriod(menstruation);
  const daysUntilPeriod = nearest(menstruation);
  const late = daysLate(predictions.menstruation?.days, cycles, today);
  const status = { late, dayOfPeriod: day, daysUntilPeriod };
  const last = lastStart(cycles);
  // The period of the last logged cycle is the predicted run that starts with it
  if (day !== undefined && last?.equals(today.subtract({ days: day - 1 }))) {
    return { ...status, phase: "menstrual" };
  }
  if (late !== undefined) {
    return { ...status, phase: "luteal" };
  }
  if (ovulation.includes(0)) {
    return { ...status, phase: "ovulation" };
  }
  const nextOvulation = nearest(ovulation);
  if (
    nextOvulation !== undefined &&
    nextOvulation < (daysUntilPeriod ?? Infinity)
  ) {
    return { ...status, phase: "follicular" };
  }
  const passed = ovulation.some((count) => {
    return count < 0;
  });
  return { ...status, phase: passed ? "luteal" : "follicular" };
};
