import { addDays, differenceInCalendarDays, subDays } from "date-fns";

import { type Cycle } from "./ICycle";

const median = (values: number[]) => {
  if (!values.length) return 0;

  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);

  return sorted.length % 2 !== 0
    ? sorted[mid]
    : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
};

export const medianCycleLength = (cycles: Cycle[]) => {
  return median(cycles.map((cycle) => cycle.cycle_length));
};

export const medianPeriodLength = (cycles: Cycle[]) => {
  return median(cycles.map((cycle) => cycle.period_length));
};

export const daysUntilNextCycle = (cycles: Cycle[]) => {
  if (!cycles.length) return;

  const cycleLength = medianCycleLength(cycles);
  const activeCycle = cycles[0];

  const nextCycleStart = addDays(activeCycle.start_date, cycleLength);
  const daysLeft = differenceInCalendarDays(nextCycleStart, new Date());

  return daysLeft > 0 ? daysLeft : 0;
};

export const ovulationDate = (cycles: Cycle[]) => {
  const LUTEAL_PHASE_DAYS = 14;

  if (!cycles.length) return;

  const cycleLength = medianCycleLength(cycles);
  const activeCycle = cycles[0];

  const ovulationOffsetDays = cycleLength - LUTEAL_PHASE_DAYS;
  return addDays(activeCycle.start_date, ovulationOffsetDays);
};

export const ovulationDateWindow = (cycles: Cycle[]) => {
  const ovulation = ovulationDate(cycles);

  if (!ovulation) return;

  return [
    subDays(ovulation, 2),
    subDays(ovulation, 1),
    ovulation,
    addDays(ovulation, 1),
  ];
};

