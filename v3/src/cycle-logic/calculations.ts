import { median } from "es-toolkit/math";
import {
  addDays,
  differenceInCalendarDays,
  isAfter,
  isSameDay,
  subDays,
} from "date-fns";

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

export const ovulationDate = (cycles: Cycle[], selectedCycle: Cycle) => {
  if (!cycles.length) return;

  const activeCycle = cycles[0];

  if (!isSameDay(selectedCycle.ovulation_date, activeCycle.ovulation_date)) {
    return selectedCycle.ovulation_date;
  }

  const cycleLength = medianCycleLength(cycles);
  const ovulationOffsetDays = cycleLength - LUTEAL_PHASE_DAYS;

  return addDays(activeCycle.start_date, ovulationOffsetDays);
};

export const ovulationDateWindow = (cycles: Cycle[], selectedCycle: Cycle) => {
  const ovulation = ovulationDate(cycles, selectedCycle);

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

  const selectedCycle = cycles.find(
    (cycle) =>
      isAfter(day, cycle.start_date) || isSameDay(day, cycle.start_date),
  );

  if (!selectedCycle) return;

  const ovulationWindow = ovulationDateWindow(cycles, selectedCycle);
  if (!ovulationWindow) return;

  const ovulationStart = ovulationWindow[0];
  const ovulationEnd = ovulationWindow.at(-1)!;

  if (day <= selectedCycle.period_end_date) return CyclePhase.Menstrual;
  if (day < ovulationStart) return CyclePhase.Follicular;
  if (day <= ovulationEnd) return CyclePhase.Ovulation;

  return CyclePhase.Luteal;
};

export const isFertile = (cycles: Cycle[], day: Date) => {
  if (!cycles.length) return;

  return cyclePhase(cycles, day) === CyclePhase.Ovulation;
};

export const addCycle = (cycles: Cycle[], startNewCycle: Date) => {
  if (!cycles.length)
    return [
      {
        cycle_length: 0,
        period_length: AVERAGE_PERIOD_LENGTH,
        start_date: startNewCycle,
        period_end_date: addDays(startNewCycle, AVERAGE_PERIOD_LENGTH),
        cycle_end_date: startNewCycle,
        ovulation_date: startNewCycle,
      },
    ];

  const finishedCycle = cycles[0];
  const cycleLength = differenceInCalendarDays(
    startNewCycle,
    finishedCycle.start_date,
  );

  const updatedLastCycle = {
    ...finishedCycle,
    cycle_length: cycleLength,
    end_date: subDays(startNewCycle, 1),
    ovulation_date: ovulationDate(cycles, finishedCycle),
  };

  const newCycle: Cycle = {
    cycle_length: 0,
    period_length: medianPeriodLength(cycles),
    start_date: startNewCycle,
    period_end_date: addDays(startNewCycle, medianPeriodLength(cycles)),
    cycle_end_date: startNewCycle,
    ovulation_date: startNewCycle,
  };

  return [newCycle, updatedLastCycle, ...cycles.slice(1)];
};

export const allPeriodDays = (cycles: Cycle[]) => {
  const allDays: Date[] = [];

  cycles.forEach((cycle) => {
    for (let i = 0; i < cycle.period_length; i++) {
      allDays.push(addDays(cycle.start_date, i));
    }
  });

  return allDays;
};

export const allOvulationDays = (cycles: Cycle[]) => {
  const ovulationDays: Date[] = [];

  cycles.forEach((cycle) => {
    const ovulationDates = ovulationDateWindow(cycles, cycle);
    if (!ovulationDates) return;

    ovulationDays.push(...ovulationDates);
  });

  return ovulationDays;
};
