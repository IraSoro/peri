import { Temporal } from "temporal-polyfill";
import type { Phase } from "../types";
import type {
  ConfigV2,
  Cycle,
  PredictionDay,
} from "@repo/config-schema/config-v2.schema";

const toPlainDate = (iso: string): Temporal.PlainDate => {
  return Temporal.Instant.from(iso).toZonedDateTimeISO("UTC").toPlainDate();
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
 * Days from today to the first predicted day that is not in the past, or
 * undefined when there is no such day. Today is the current UTC date unless given
 */
export const daysUntilPeriod = (
  days: PredictionDay[] | undefined,
  today: Temporal.PlainDate = Temporal.Now.plainDateISO("UTC"),
): number | undefined => {
  return nearest(offsets(days, today));
};

/**
 * Which day of the predicted period today is. Predicted days that follow each
 * other form one period, so with predicted days Jan 8, 9, 10 and 11 and today
 * on Jan 10 the result is 3. Undefined when today is not a predicted day
 */
export const dayOfPeriod = (
  days: PredictionDay[] | undefined,
  today: Temporal.PlainDate = Temporal.Now.plainDateISO("UTC"),
): number | undefined => {
  const past = new Set(offsets(days, today));
  if (!past.has(0)) {
    return undefined;
  }
  let number = 1;
  while (past.has(-number)) {
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
  const dates = new Set(
    (days ?? []).map((day) => {
      return toPlainDate(day.date).toString();
    }),
  );
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
export const daysLate = (
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
  const ovulation = new Set(
    (ovulationDays ?? []).map((day) => {
      return toPlainDate(day.date).toString();
    }),
  );
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
 * The phase today falls in. A day of the logged period is menstrual and a
 * late period counts as luteal. Otherwise an ovulation day is ovulation, the
 * days before the next ovulation are follicular and the days after the last
 * one are luteal. Follicular is the default
 */
export const currentPhase = (
  predictions: ConfigV2["predictions"],
  cycles: Cycle[],
  today: Temporal.PlainDate = Temporal.Now.plainDateISO("UTC"),
): Phase => {
  const day = dayOfPeriod(predictions.menstruation?.days, today);
  const last = lastStart(cycles);
  // The period of the last logged cycle is the predicted run that starts with it
  if (day !== undefined && last?.equals(today.subtract({ days: day - 1 }))) {
    return "menstrual";
  }
  if (daysLate(predictions.menstruation?.days, cycles, today) !== undefined) {
    return "luteal";
  }
  const ovulation = offsets(predictions.ovulation?.days, today);
  if (ovulation.includes(0)) {
    return "ovulation";
  }
  const nextPeriod = nearest(offsets(predictions.menstruation?.days, today));
  const nextOvulation = nearest(ovulation);
  if (nextOvulation !== undefined && nextOvulation < (nextPeriod ?? Infinity)) {
    return "follicular";
  }
  return ovulation.some((count) => {
    return count < 0;
  })
    ? "luteal"
    : "follicular";
};
