import { addDays, differenceInCalendarDays } from "date-fns";

import { type Cycle } from "./ICycle";

export const averageCycleLength = (cycles: Cycle[]) => {
  const totalLength = cycles.reduce(
    (sum, cycle) => sum + cycle.cycle_length,
    0,
  );

  return cycles.length ? Math.round(totalLength / cycles.length) : 0;
};

export const averagePeriodLength = (cycles: Cycle[]) => {
  const totalLength = cycles.reduce(
    (sum, cycle) => sum + cycle.period_length,
    0,
  );

  return cycles.length ? Math.round(totalLength / cycles.length) : 0;
};

export function daysUntilNextCycle(cycles: Cycle[]) {
  if (!cycles.length) return;

  const cycleLength = averageCycleLength(cycles);
  const lastCycle = cycles[0];

  const nextCycleStart = addDays(lastCycle.start_date, cycleLength);
  const daysLeft = differenceInCalendarDays(nextCycleStart, new Date());

  return daysLeft > 0 ? daysLeft : 0;
}

