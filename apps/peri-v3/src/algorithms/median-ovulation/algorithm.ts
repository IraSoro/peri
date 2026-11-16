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

const LUTEAL_PHASE_DAYS = 14;
// Days around the ovulation day: two before, the day itself, one after
const OVULATION_WINDOW = [-2, -1, 0, 1];

/**
 * Predicts ovulation from the median cycle length of the history. Ovulation
 * falls 14 days before the next cycle starts, the window is 4 days around it.
 * It covers the current cycle and the next 6. Cycles must be sorted oldest
 * first, as the cycles service keeps them
 */
export function run(input: AlgorithmInput): AlgorithmOutput {
  const last = input.cycles.at(-1);
  if (!last) {
    return { days: [] };
  }

  const cycleLength = medianCycleLength(input.cycles);
  const lastStart = Temporal.Instant.from(last.start_date).toZonedDateTimeISO(
    "UTC",
  );
  const days: { date: string }[] = [];
  for (let i = 0; i <= FUTURE_CYCLES; i++) {
    const start = lastStart.add({ days: i * cycleLength });
    const ovulationDay = start.add({ days: cycleLength - LUTEAL_PHASE_DAYS });
    for (const offset of OVULATION_WINDOW) {
      days.push({
        date: formatInstant(ovulationDay.add({ days: offset }).toInstant()),
      });
    }
  }

  return { days };
}

void defineInternalAlgorithm(manifest, { run });
