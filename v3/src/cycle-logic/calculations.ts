import { median } from "es-toolkit/math";
import { addDays, differenceInCalendarDays, subDays } from "date-fns";

import { type Cycle } from "./ICycle";

const LUTEAL_PHASE_DAYS = 14;
const AVERAGE_PERIOD_LENGTH = 5;

export const CyclePhase = {
  Menstrual: 0,
  Follicular: 1,
  Ovulation: 2,
  Luteal: 3,
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

export const cyclePhase = (cycles: Cycle[], day: Date) => {
  if (!cycles.length) return;

  const activeCycle = cycles[0];
  const menstruationEnd = addDays(
    activeCycle.start_date,
    activeCycle.period_length - 1,
  );

  const ovulationWindow = ovulationDateWindow(cycles);
  if (!ovulationWindow || ovulationWindow.length === 0) return;

  const ovulationStart = ovulationWindow[0];
  const ovulationEnd = ovulationWindow.at(-1)!;

  if (day <= menstruationEnd) return CyclePhase.Menstrual;
  if (day < ovulationStart) return CyclePhase.Follicular;
  if (day <= ovulationEnd) return CyclePhase.Ovulation;

  return CyclePhase.Luteal;
};

export const isFertile = (cycles: Cycle[], day: Date) => {
  if (!cycles.length) return;

  return cyclePhase(cycles, day) === CyclePhase.Ovulation;
};

export const addCycle = (cycles: Cycle[], startNewCycle: Date) => {
  if (!cycles.length) {
    const newCycle = {
      cycle_length: 0,
      period_length: AVERAGE_PERIOD_LENGTH,
      start_date: startNewCycle,
      end_date: null,
      ovulation_date: null,
    };

    return [newCycle];
  }

  const finishedCycle = cycles[0];
  const cycleLength = differenceInCalendarDays(
    startNewCycle,
    finishedCycle.start_date,
  );
  const endDate = subDays(startNewCycle, 1);

  const updatedLastCycle = {
    ...finishedCycle,
    cycle_length: cycleLength,
    end_date: endDate,
    ovulation_date: ovulationDate(cycles),
  };

  const newCycle = {
    cycle_length: 0,
    period_length: medianPeriodLength(cycles),
    start_date: startNewCycle,
    end_date: null,
    ovulation_date: null,
  };

  return [newCycle, updatedLastCycle, ...cycles.slice(1)];
};
