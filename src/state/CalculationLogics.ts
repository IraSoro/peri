import i18n from "i18next";
import {
  addDays,
  differenceInDays,
  parseISO,
  startOfDay,
  startOfToday,
} from "date-fns";

import { Cycle } from "../data/ICycle";
import { format } from "../utils/datetime";

export function getLastStartDate(cycles: Cycle[]) {
  if (cycles.length === 0) {
    return "";
  }

  return cycles[0].startDate;
}

export function getLengthOfLastPeriod(cycles: Cycle[]) {
  if (cycles.length === 0) {
    return 0;
  }

  return cycles[0].periodLength;
}

export function getDayOfCycle(cycles: Cycle[]) {
  if (cycles.length === 0) {
    return 0;
  }

  const start = startOfDay(new Date(cycles[0].startDate));
  const currentDate = startOfToday();

  return differenceInDays(currentDate, start) + 1;
}

// NOTE: Detailed description of ovulation calculation: https://github.com/IraSoro/peri/blob/master/info/CALCULATION.md#ovulation-day
export function getOvulationStatus(
  cycles: Cycle[],
  maxDisplayedCycles: number,
) {
  if (cycles.length === 0) {
    return "";
  }

  const shortestCycle = getShortestCycleLength(cycles, maxDisplayedCycles);
  const longestCycle = getLongestCycleLength(cycles, maxDisplayedCycles);
  const dayOfCycle = getDayOfCycle(cycles);

  // Length of the luteal phase in days (fixed value)
  const lutealPhaseLength = 14;

  // Calculate ovulation days based on shortest and longest cycles
  // For shortest cycle: earlier ovulation
  // For longest cycle: later ovulation
  const ovulationDayEarliest = shortestCycle - lutealPhaseLength;
  const ovulationDayLatest = longestCycle - lutealPhaseLength;

  // Calculate the difference between the current day of the cycle and the ovulation window
  const diffDayEarliest = ovulationDayEarliest - dayOfCycle;
  const diffDayLatest = ovulationDayLatest - dayOfCycle;

  // If we're past the latest possible ovulation day (with error margin), ovulation is finished
  if (diffDayLatest < -2) {
    return i18n.t("finished");
  }

  // Check if ovulation is today (within the earliest to latest range)
  if (diffDayEarliest <= 0 && diffDayLatest >= 0) {
    return i18n.t("today");
  }

  // Check if ovulation is tomorrow
  if (diffDayEarliest <= 1 && diffDayLatest >= 1) {
    return i18n.t("tomorrow");
  }

  // If we're within the ovulation window or close to it (including error margin)
  if (diffDayEarliest <= 2 && diffDayLatest >= -2) {
    return i18n.t("possible");
  }

  // Before ovulation window - report days until earliest ovulation
  if (diffDayEarliest > 0) {
    return `${i18n.t("in")} ${diffDayEarliest} ${i18n.t("Days", {
      postProcess: "interval",
      count: diffDayEarliest,
    })}`;
  }

  // Should not reach here, but return possible as fallback
  return i18n.t("possible");
}

export function getPregnancyChance(
  cycles: Cycle[],
  maxDisplayedCycles: number,
) {
  if (cycles.length === 0) {
    return "";
  }

  const ovulationStatus = getOvulationStatus(cycles, maxDisplayedCycles);
  if (
    ["tomorrow", "today", "possible"].some((status) =>
      ovulationStatus.includes(i18n.t(status)),
    )
  ) {
    return i18n.t("High");
  }

  return i18n.t("Low");
}

export function getDaysBeforePeriod(
  cycles: Cycle[],
  maxDisplayedCycles: number,
) {
  if (cycles.length === 0) {
    return {
      title: i18n.t("Period in"),
      days: i18n.t("---"),
    };
  }

  const periodLength = cycles[0].periodLength;
  const dayOfCycle = getDayOfCycle(cycles);

  // The cycle starts with period, so if the current day of the cycle is, for example, 3 (dayOfCycle = 3), and period lasts 6 days (periodLength = 6), then the result is "Period 3rd day"
  if (dayOfCycle <= periodLength) {
    return {
      title: i18n.t("Period"),
      days: `${i18n.t("day", {
        count: dayOfCycle,
        ordinal: true,
      })}`,
    };
  }

  // NOTE: 28 is the default cycle length. If there is only one cycle in the array, its length will be 28. But since this is the first cycle, we do not know its exact length, it may be longer. Therefore, in this case, we do not display the "Delay", but display the "possible today"
  if (cycles.length === 1 && cycles[0].cycleLength >= 28) {
    return {
      title: i18n.t("Period is"),
      days: i18n.t("possible today"),
    };
  }

  // We know the start date of the cycle
  const startDate = cycles[0].startDate;
  // We know the length of the cycle (the average of all cycles)
  const cycleLength = getAverageLengthOfCycle(cycles, maxDisplayedCycles);

  // So we can calculate the end date of the cycle
  const dateOfFinish = addDays(startOfDay(new Date(startDate)), cycleLength);
  const now = startOfToday();
  // We calculate how many days are left until the end of the cycle
  const dayBefore = differenceInDays(dateOfFinish, now);

  if (dayBefore > 0) {
    return {
      title: i18n.t("Period in"),
      days: `${dayBefore} ${i18n.t("Days", {
        postProcess: "interval",
        count: dayBefore,
      })}`,
    };
  }

  if (dayBefore === 0) {
    return {
      title: i18n.t("Period"),
      days: i18n.t("today"),
    };
  }

  return {
    title: i18n.t("Delay"),
    days: `${Math.abs(dayBefore)} ${i18n.t("Days", {
      postProcess: "interval",
      count: Math.abs(dayBefore),
    })}`,
  };
}

export function getPhase(cycles: Cycle[], maxDisplayedCycles: number) {
  const shortestCycle = getShortestCycleLength(cycles, maxDisplayedCycles);
  const longestCycle = getLongestCycleLength(cycles, maxDisplayedCycles);
  const lengthOfPeriod = getLengthOfLastPeriod(cycles);
  const currentDay = getDayOfCycle(cycles);

  const lutealPhaseLength = 14;
  const ovulationOnError = 2;

  const phases = {
    non: {
      title: "",
      description: "",
      symptoms: [""],
    },
    menstrual: {
      title: i18n.t("Menstrual phase"),
      description: i18n.t("This cycle is accompanied by low hormone levels."),
      symptoms: [
        i18n.t("lack of energy and strength"),
        i18n.t("pain"),
        i18n.t("weakness and irritability"),
        i18n.t("increased appetite"),
      ],
    },
    follicular: {
      title: i18n.t("Follicular phase"),
      description: i18n.t(
        "The level of estrogen in this phase rises and reaches a maximum level.",
      ),
      symptoms: [
        i18n.t("strength and vigor appear"),
        i18n.t("endurance increases"),
        i18n.t("new ideas and plans appear"),
        i18n.t("libido increases"),
      ],
    },
    ovulation: {
      title: i18n.t("Ovulation phase"),
      description: i18n.t(
        "Once estrogen levels peak, they trigger the release of two important ovulation hormones, follicle-stimulating hormone and luteinizing hormone.",
      ),
      symptoms: [
        i18n.t("increased sexual desire"),
        i18n.t("optimistic mood"),
        i18n.t("mild fever"),
        i18n.t("lower abdominal pain"),
        i18n.t("chest discomfort and bloating"),
        i18n.t("characteristic secretions"),
      ],
    },
    luteal: {
      title: i18n.t("Luteal phase"),
      description: i18n.t(
        "Levels of the hormones estrogen and progesterone first rise and then drop sharply just before a period. Progesterone reaches its peak in the luteal phase.",
      ),
      symptoms: [
        i18n.t("breast tenderness"),
        i18n.t("puffiness"),
        i18n.t("acne and skin rashes"),
        i18n.t("increased appetite"),
        i18n.t("diarrhea or constipation"),
        i18n.t("irritability and depressed mood"),
      ],
    },
  };

  if (cycles.length === 0) {
    return phases.non;
  }
  if (currentDay <= lengthOfPeriod) {
    return phases.menstrual;
  }

  // Use earliest ovulation day (from shortest cycle) to determine phase boundaries
  const ovulationDayEarliest = shortestCycle - lutealPhaseLength;
  const ovulationDayLatest = longestCycle - lutealPhaseLength;

  // Follicular phase: after period and before the earliest ovulation (with error margin)
  if (currentDay <= ovulationDayEarliest - ovulationOnError) {
    return phases.follicular;
  }
  // Ovulation phase: from earliest ovulation (with error) to latest ovulation (with error)
  if (currentDay <= ovulationDayLatest + ovulationOnError) {
    return phases.ovulation;
  }
  // Luteal phase: after ovulation ends
  return phases.luteal;
}

export function getAverageLengthOfCycle(
  cycles: Cycle[],
  maxDisplayedCycles: number,
) {
  const displayedCycles = cycles.slice(0, maxDisplayedCycles);
  const length = displayedCycles.length;

  if (length <= 1) {
    // NOTE: If there is only one cycle in history (the current one), then its length is at least 28 or more
    return length === 0 ? 0 : displayedCycles[0].cycleLength;
  }

  const sum = displayedCycles.reduce(
    (prev, current) => prev + current.cycleLength,
    0,
  );

  //NOTE: We subtract 1 because the length of the current cycle is 0 (i.e. cycles[0].cycleLength = 0) and we don't need to take it into account in the calculation.
  return Math.round(sum / (length - 1));
}

export function getShortestCycleLength(
  cycles: Cycle[],
  maxDisplayedCycles: number,
) {
  const displayedCycles = cycles.slice(0, maxDisplayedCycles);
  const length = displayedCycles.length;

  if (length <= 1) {
    // NOTE: If there is only one cycle in history (the current one), then its length is at least 28 or more
    return length === 0 ? 0 : displayedCycles[0].cycleLength;
  }

  // Filter out the current cycle (cycleLength = 0) and find the shortest cycle
  const completedCycles = displayedCycles.filter(
    (cycle) => cycle.cycleLength > 0,
  );

  if (completedCycles.length === 0) {
    return 28; // Default value
  }

  return Math.min(...completedCycles.map((cycle) => cycle.cycleLength));
}

export function getLongestCycleLength(
  cycles: Cycle[],
  maxDisplayedCycles: number,
) {
  const displayedCycles = cycles.slice(0, maxDisplayedCycles);
  const length = displayedCycles.length;

  if (length <= 1) {
    // NOTE: If there is only one cycle in history (the current one), then its length is at least 28 or more
    return length === 0 ? 0 : displayedCycles[0].cycleLength;
  }

  // Filter out the current cycle (cycleLength = 0) and find the longest cycle
  const completedCycles = displayedCycles.filter(
    (cycle) => cycle.cycleLength > 0,
  );

  if (completedCycles.length === 0) {
    return 28; // Default value
  }

  return Math.max(...completedCycles.map((cycle) => cycle.cycleLength));
}

export function getAverageLengthOfPeriod(
  cycles: Cycle[],
  maxDisplayedCycles: number,
) {
  const displayedCycles = cycles.slice(0, maxDisplayedCycles);
  const length = displayedCycles.length;

  if (length <= 1) {
    return length === 0 ? 0 : displayedCycles[0].periodLength;
  }

  const sum = displayedCycles.reduce(
    (prev, current) => prev + current.periodLength,
    0,
  );

  return Math.round(sum / length);
}

// This function creates a new "cycles" array.
// The "periodDays" parameter is an array of marked dates in the calendar (i.e. all marked dates of the period)
export function getNewCyclesHistory(periodDays: string[]) {
  if (periodDays.length === 0) {
    return [];
  }

  periodDays.sort((left, right) => {
    const leftDate = new Date(left);
    const rightDate = new Date(right);
    return leftDate.getTime() - rightDate.getTime();
  });

  let newCycles: Cycle[] = [
    {
      // If there is only one cycle in the array, length of this cycle will be 28 (default length)
      cycleLength: 28,
      periodLength: 1,
      startDate: periodDays[0],
    },
  ];

  // In this we form a new "cycles" array
  for (let i = 1; i < periodDays.length; i++) {
    const date = startOfDay(new Date(periodDays[i]));
    const prevDate = startOfDay(new Date(periodDays[i - 1]));
    const diffInDays = differenceInDays(date, prevDate);

    // If "diffInDays" is 1, it means that the dates are consecutive. (The "diffInDays" is always >=0 because the array is sorted and "prevDate" is always less than "date")
    // If "diffInDays" is 2, it means that there is one day between them.
    // Our algorithm only works if the dates of the month are consecutive. Therefore, we "fill" the day between them.
    if (diffInDays <= 2) {
      newCycles[0].periodLength += diffInDays;
    } else {
      newCycles[0].cycleLength = diffInDays + newCycles[0].periodLength - 1;
      newCycles.unshift({
        cycleLength: 0,
        periodLength: 1,
        startDate: periodDays[i],
      });
    }
  }

  // Additional verification. As a result, newCycles will contain only those cycles that have already started at the current time.
  newCycles = newCycles.filter((cycle) => {
    return startOfDay(new Date(cycle.startDate)) <= startOfToday();
  });

  return newCycles;
}

export function getMaxStoredCountOfCycles(maxDisplayedCycles: number) {
  // NOTE: maxDisplayedCycles is the number of cycles we display in details. We store a maximum of maxDisplayedCycles + 2 cycles (for case the last cycle is accidentally deleted)
  return maxDisplayedCycles + 2;
}

// The function returns an array of generated dates
export function getPeriodDates(cycles: Cycle[], maxDisplayedCycles: number) {
  const periodDays: string[] = [];
  const maxOfCycles = getMaxStoredCountOfCycles(maxDisplayedCycles);

  cycles.slice(0, maxOfCycles).forEach((cycle) => {
    const startOfCycle = startOfDay(new Date(cycle.startDate));

    const days = Array.from({ length: cycle.periodLength }, (_, i) =>
      format(addDays(startOfCycle, i), "yyyy-MM-dd"),
    );

    periodDays.push(...days);
  });

  return periodDays;
}

export function getPeriodDatesOfLastCycle(cycles: Cycle[]) {
  if (cycles.length === 0) {
    return [];
  }

  const lastCycle = cycles[0];
  const startOfCycle = startOfDay(new Date(lastCycle.startDate));

  return Array.from({ length: lastCycle.periodLength }, (_, i) =>
    format(addDays(startOfCycle, i), "yyyy-MM-dd"),
  );
}

// Checking if a date can be edited in calendar editing mode
export function getActiveDates(date: Date, cycles: Cycle[]) {
  const maybeActiveDate = startOfDay(date);
  const now = startOfToday();

  if (cycles.length === 0) {
    return maybeActiveDate <= now;
  }

  const endPeriod = addDays(
    startOfDay(new Date(cycles[0].startDate)),
    cycles[0].periodLength - 1,
  );

  return maybeActiveDate <= endPeriod || maybeActiveDate <= now;
}

// The function returns the dates of all previous cycles, and adds the dates for the current cycle, starting from today and for several days after
export function getPeriodDatesWithNewElement(
  cycles: Cycle[],
  maxDisplayedCycles: number,
) {
  const nowDate = startOfToday();
  // Forming an array of dates based on cycles
  // getPeriodDates(cycles) returns an array of strings with dates in ISO format
  // Using map , these strings are converted to Date objects, and then back to strings, but in the format returned by Date.prototype.toString()
  const periodDates = getPeriodDates(cycles, maxDisplayedCycles).map(
    (isoDateString) => parseISO(isoDateString).toString(),
  );
  // Gets the average length of the period based on the given cycles
  // If the average length is not defined, it defaults to 5 days (for the case when the array is empty)
  const lengthOfPeriod =
    getAverageLengthOfPeriod(cycles, maxDisplayedCycles) || 5;

  // Checking for completion of current period
  if (cycles.length > 0) {
    // It calculates the end date of the last period (period of current cycle)
    const endOfCurrentCycle = addDays(
      startOfDay(new Date(cycles[0].startDate)),
      cycles[0].periodLength,
    );
    // If the period has not yet completed, the function returns an empty array, since there is no need to add new dates
    if (endOfCurrentCycle >= nowDate) {
      return [];
    }
  }

  // Create additional dates that start from today and continue for several days (it's a new cycle, a new future element of the array)
  const additionalDays = Array.from({ length: lengthOfPeriod }, (_, i) =>
    addDays(nowDate, i).toString(),
  );

  return periodDates.concat(additionalDays);
}

export function getForecastPeriodDates(
  cycles: Cycle[],
  maxDisplayedCycles: number,
) {
  if (cycles.length === 0) {
    return [];
  }

  const lengthOfCycle = getAverageLengthOfCycle(cycles, maxDisplayedCycles);
  const lengthOfPeriod = getAverageLengthOfPeriod(cycles, maxDisplayedCycles);
  const dayOfCycle = getDayOfCycle(cycles);
  const nowDate = startOfToday();
  const forecastDates: string[] = [];

  // We determine the start date of the next nearest cycle
  let nextCycleStart =
    dayOfCycle <= lengthOfCycle
      ? // This is for the case when the current calculation cycle has not yet ended
        addDays(startOfDay(new Date(cycles[0].startDate)), lengthOfCycle)
      : // This is for the case if there is a delay today. Then the beginning of the next cycle will be from today
        nowDate;

  // Function to add dates to a "forecastDates" array
  const addForecastDates = (startDate: Date) => {
    forecastDates.push(
      ...Array.from({ length: lengthOfPeriod }, (_, i) =>
        format(addDays(startDate, i), "yyyy-MM-dd"),
      ),
    );
  };

  addForecastDates(nextCycleStart);

  // If there is only one cycle in the array we will not make a prediction more than one cycle. Because we don't know the exact length of the cycle
  if (cycles.length === 1) {
    return forecastDates;
  }

  // Add dates for the next 6 cycles
  // NOTE: 6 - the number of cycles hat we count for the forecast
  Array.from({ length: 6 }).forEach(() => {
    nextCycleStart = addDays(nextCycleStart, lengthOfCycle);
    addForecastDates(nextCycleStart);
  });

  return forecastDates;
}

// NOTE: This Function is needed to block the Mark button if today is period
export function isPeriodToday(cycles: Cycle[]) {
  if (cycles.length === 0) {
    return false;
  }

  const dayOfCycle = getDayOfCycle(cycles);

  return dayOfCycle <= cycles[0].periodLength;
}

export function getOvulationDates(cycles: Cycle[], maxDisplayedCycles: number) {
  if (cycles.length < 2) {
    return [];
  }

  const shortestCycle = getShortestCycleLength(cycles, maxDisplayedCycles);
  const longestCycle = getLongestCycleLength(cycles, maxDisplayedCycles);
  const dayOfCycle = getDayOfCycle(cycles);
  const ovulationDates = [];

  for (const cycle of cycles) {
    const startOfCycle = startOfDay(new Date(cycle.startDate));

    // Calculate ovulation range based on shortest and longest cycles
    // NOTE: Using shortest cycle for earliest ovulation, longest for latest
    // We subtract 16 (14 for luteal phase + 2 for error margin) to get the start of the ovulation window
    let ovulationStartDay: number;
    let ovulationEndDay: number;

    if (cycle.cycleLength > 0) {
      // For completed cycles, calculate based on the actual cycle length
      // But also consider the variation from shortest to longest
      const cycleVariation = longestCycle - shortestCycle;
      ovulationStartDay =
        cycle.cycleLength - 16 - Math.floor(cycleVariation / 2);
      ovulationEndDay =
        cycle.cycleLength - 16 + Math.ceil(cycleVariation / 2) + 3;
    } else {
      // For current cycle
      if (dayOfCycle > longestCycle) {
        // Delay case
        ovulationStartDay = dayOfCycle - 17 - (longestCycle - shortestCycle);
        ovulationEndDay = dayOfCycle - 13;
      } else {
        // Normal case - use range from shortest to longest
        ovulationStartDay = shortestCycle - 16;
        ovulationEndDay = longestCycle - 13; // Base ovulation day plus a small window
      }
    }

    // Ensure we don't have negative days
    ovulationStartDay = Math.max(1, ovulationStartDay);
    const numDays = ovulationEndDay - ovulationStartDay + 1;

    // Add all days in the ovulation range
    ovulationDates.push(
      ...Array.from({ length: numDays }, (_, i) =>
        format(addDays(startOfCycle, ovulationStartDay + i), "yyyy-MM-dd"),
      ),
    );
  }

  return ovulationDates.concat(
    getFutureOvulationDates(cycles, maxDisplayedCycles),
  );
}

export function getFutureOvulationDates(
  cycles: Cycle[],
  maxDisplayedCycles: number,
) {
  if (cycles.length < 2) return [];

  const averageCycle = getAverageLengthOfCycle(cycles, maxDisplayedCycles);
  const shortestCycle = getShortestCycleLength(cycles, maxDisplayedCycles);
  const longestCycle = getLongestCycleLength(cycles, maxDisplayedCycles);
  const dayOfCycle = getDayOfCycle(cycles);
  const nowDate = startOfToday();
  const ovulationDates: string[] = [];

  const addOvulationDates = (startDate: Date) => {
    // Calculate the range of ovulation days for future cycles
    // Using shortest cycle for earliest ovulation, longest for latest
    const ovulationStartDay = shortestCycle - 16;
    const ovulationEndDay = longestCycle - 13; // Base ovulation day plus a small window
    const numDays = ovulationEndDay - ovulationStartDay + 1;

    ovulationDates.push(
      ...Array.from({ length: numDays }, (_, i) =>
        format(addDays(startDate, ovulationStartDay + i), "yyyy-MM-dd"),
      ),
    );
  };

  let nextCycleStartDate =
    dayOfCycle <= averageCycle
      ? addDays(startOfDay(new Date(cycles[0].startDate)), averageCycle)
      : nowDate;

  addOvulationDates(nextCycleStartDate);

  // 5 - the number of cycles for which we will calculate ovulation
  Array.from({ length: 5 }).forEach(() => {
    nextCycleStartDate = addDays(nextCycleStartDate, averageCycle);
    addOvulationDates(nextCycleStartDate);
  });

  return ovulationDates;
}

// NOTE: This function calculates the date for notification
export function getPeriodShiftInDays(
  cycles: Cycle[],
  periodShiftInDays: number,
  maxDisplayedCycles: number,
) {
  const cycleLength = getAverageLengthOfCycle(cycles, maxDisplayedCycles);
  return addDays(
    startOfDay(new Date(cycles[0].startDate)),
    cycleLength + periodShiftInDays,
  );
}
