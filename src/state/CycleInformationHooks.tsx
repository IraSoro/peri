import { useContext } from "react";
import { CyclesContext } from "./Context";
import {
  getDayOfCycle,
  // getAverageLengthOfCycle,
  // getAverageLengthOfPeriod,
  getAverageLength,
} from "./CalculationLogics";

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
  return getAverageLength(cycles, "cycleLength");
}

export function useAverageLengthOfPeriod(): number {
  const cycles = useContext(CyclesContext).cycles;
  return getAverageLength(cycles, "periodLength");
}

export function useLengthOfLastPeriod(): number {
  const cycles = useContext(CyclesContext).cycles;

  if (cycles.length === 0) {
    return 0;
  }

  return Number(cycles[0].periodLength);
}
