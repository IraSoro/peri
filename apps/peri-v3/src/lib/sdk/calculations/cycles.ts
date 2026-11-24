import { mean } from "es-toolkit/math";
import { Temporal } from "temporal-polyfill";
import type {
  Cycle,
  PredictionDay,
} from "@repo/config-schema/config-v2.schema";
import type { Phase } from "../types";
import { phasesOfCycle } from "./predictions";
import { toPlainDate } from "./dates";

export type CycleStats = {
  /** Average cycle length in days and the largest deviation from it */
  cycleLength: { average: number; deviation: number } | undefined;
  /** Average period length in days */
  periodLength: number | undefined;
};

/**
 * Average lengths of the logged cycles. The open current cycle has no length
 * yet, so only finished cycles count for the cycle length. A value is
 * undefined when there is nothing to average
 */
export const cycleStats = (cycles: Cycle[]): CycleStats => {
  const lengths = cycles.flatMap((cycle) => {
    return cycle.cycle_length === null ? [] : [cycle.cycle_length];
  });
  const periods = cycles.map((cycle) => {
    return cycle.period_length;
  });
  const center = mean(lengths);
  return {
    cycleLength:
      lengths.length > 0
        ? {
            average: Math.round(center),
            deviation: Math.round(
              Math.max(
                ...lengths.map((length) => {
                  return Math.abs(length - center);
                }),
              ),
            ),
          }
        : undefined,
    periodLength: periods.length > 0 ? Math.round(mean(periods)) : undefined,
  };
};

/**
 * Which day of the cycle today is. The day the cycle starts on is day 1, so
 * a cycle that began today has 0 days passed and the result is 1
 */
export const dayOfCycle = (
  cycle: Cycle,
  today: Temporal.PlainDate = Temporal.Now.plainDateISO("UTC"),
): number => {
  const start = toPlainDate(cycle.start_date);
  return start.until(today, { largestUnit: "days" }).days + 1;
};

/**
 * The phase of every day of a finished cycle, empty for the open cycle. The
 * ovulation days are what the ovulation algorithm predicts for the cycle, see
 * `historyAt`
 */
export const pastPhasesByDay = (
  cycle: Cycle,
  ovulationDays: PredictionDay[],
): Phase[] => {
  if (cycle.cycle_length === null) {
    return [];
  }
  return phasesOfCycle(cycle, cycle.cycle_length, ovulationDays);
};

/**
 * The history an algorithm had when the cycle began: the cycles before it and
 * the cycle itself as the open current one. Empty when the cycle is not among
 * the cycles. Nothing is stored about the predictions of past cycles, so they
 * are made again from this history
 */
export const historyAt = (cycles: Cycle[], cycle: Cycle): Cycle[] => {
  const index = cycles.findIndex((item) => {
    return item.start_date === cycle.start_date;
  });
  if (index === -1) {
    return [];
  }
  return [
    ...cycles.slice(0, index),
    { ...cycle, end_date: null, cycle_length: null },
  ];
};
