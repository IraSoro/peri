import { median as esMedian } from "es-toolkit/math";
import { Temporal } from "temporal-polyfill";
import type { Cycle } from "@repo/config-schema/config-v2.schema";
import { defineInternalAlgorithm } from "@/lib/sdk/algorithm/api";
import { formatInstant } from "@/lib/utils/dates";
import type {
  AlgorithmInput,
  AlgorithmOutput,
} from "@/services/algorithms/types";
import { manifest } from "./manifest";

const FUTURE_CYCLES = 6;
const DEFAULT_CYCLE_LENGTH = 28;
const DEFAULT_PERIOD_LENGTH = 5;

const median = (values: number[], fallback: number): number => {
  if (values.length === 0) {
    return fallback;
  }
  return Math.round(esMedian(values));
};

const medianCycleLength = (cycles: readonly Cycle[]): number => {
  return median(
    cycles.flatMap((cycle) => {
      return cycle.cycle_length === null ? [] : [cycle.cycle_length];
    }),
    DEFAULT_CYCLE_LENGTH,
  );
};

const medianPeriodLength = (cycles: readonly Cycle[]): number => {
  return median(
    cycles.map((cycle) => {
      return cycle.period_length;
    }),
    DEFAULT_PERIOD_LENGTH,
  );
};

/**
 * Predicts the periods of the next 6 cycles from the median cycle and period
 * length of the history. Cycles must be sorted oldest first, as the cycles
 * service keeps them
 */
export function run(input: AlgorithmInput): AlgorithmOutput {
  const last = input.cycles.at(-1);
  if (!last) {
    return { days: [] };
  }

  const cycleLength = medianCycleLength(input.cycles);
  const periodLength = medianPeriodLength(input.cycles);
  const lastStart = Temporal.Instant.from(last.start_date).toZonedDateTimeISO(
    "UTC",
  );
  const days: { date: string }[] = [];
  // The current cycle is history, only the next ones have a predicted period
  for (let i = 1; i <= FUTURE_CYCLES; i++) {
    const start = lastStart.add({ days: i * cycleLength });
    for (let day = 0; day < periodLength; day++) {
      days.push({
        date: formatInstant(start.add({ days: day }).toInstant()),
      });
    }
  }

  return { days };
}

void defineInternalAlgorithm(manifest, { run });
