import { useContext } from "react";
import { CyclesContext } from "./Context";
import { getDayOfCycle } from "./CalculationLogics";

export function useLastStartDate(): string {
  const cycles = useContext(CyclesContext).cycles;

  if (cycles.length === 0) {
    return "";
  }

  return cycles[0].startDate;
}

export function useDayOfCycle(): string {
  const startDate = useLastStartDate();
  return getDayOfCycle(startDate);
}

export function useAverageLengthOfCycle(): number {
  const cycles = useContext(CyclesContext).cycles;

  if (cycles.length === 0) {
    return 0;
  }

  if (cycles.length === 1) {
    return cycles[0].cycleLength;
  }

  const sum = cycles.reduce((prev, current, idx) => {
    if (idx > 0) {
      return prev + current.cycleLength;
    }
    return 0;
  }, 0);

  return Math.round(sum / (cycles.length - 1));
}

export function useAverageLengthOfPeriod(): number {
  const cycles = useContext(CyclesContext).cycles;

  if (cycles.length === 0) {
    return 0;
  }

  if (cycles.length === 1) {
    return cycles[0].periodLength;
  }

  const sum = cycles.reduce((prev, current, idx) => {
    if (idx > 0) {
      return prev + current.periodLength;
    }
    return 0;
  }, 0);

  return Math.round(sum / (cycles.length - 1));
}

export function useLengthOfLastPeriod(): number {
  const cycles = useContext(CyclesContext).cycles;

  if (cycles.length === 0) {
    return 0;
  }

  return Number(cycles[0].periodLength);
}
