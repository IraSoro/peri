import i18n from "i18next";
import { addDays, differenceInDays, startOfDay, startOfToday } from "date-fns";

import { Cycle } from "../data/ClassCycle";
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

  return Number(cycles[0].periodLength);
}

export function getOvulationStatus(cycles: Cycle[]) {
  if (cycles.length === 0) {
    return "";
  }

  const cycleLength = getAverageLengthOfCycle(cycles);
  const dayOfCycle = getDayOfCycle(cycles);

  const lutealPhaseLength = 14;
  const ovulationDay = cycleLength - lutealPhaseLength;
  const diffDay = ovulationDay - dayOfCycle;
  if (diffDay < -2) {
    return i18n.t("finished");
  }
  if (diffDay < 0) {
    return i18n.t("possible");
  }
  if (diffDay === 0) {
    return i18n.t("today");
  }
  if (diffDay === 1) {
    return i18n.t("tomorrow");
  }
  return `${i18n.t("in")} ${diffDay} ${i18n.t("Days", {
    postProcess: "interval",
    count: diffDay,
  })}`;
}

export function getPregnancyChance(cycles: Cycle[]) {
  if (cycles.length === 0) {
    return "";
  }

  const dayOfCycle = getDayOfCycle(cycles);
  const cycleLength = getAverageLengthOfCycle(cycles);

  const lutealPhaseLength = 14;
  const ovulationDay = cycleLength - lutealPhaseLength;
  const diffDay = ovulationDay - dayOfCycle;

  if (diffDay >= -2 && diffDay <= 1) {
    return i18n.t("High");
  }
  return i18n.t("Low");
}

export function getDaysBeforePeriod(cycles: Cycle[]) {
  if (cycles.length === 0) {
    return {
      title: i18n.t("Period in"),
      days: i18n.t("---"),
    };
  }

  const periodLength = cycles[0].periodLength;
  const dayOfCycle = Number(getDayOfCycle(cycles));

  if (dayOfCycle <= periodLength) {
    return {
      title: i18n.t("Period"),
      days: `${i18n.t("day", {
        count: dayOfCycle,
        ordinal: true,
      })}`,
    };
  }

  const startDate = cycles[0].startDate;
  const cycleLength = getAverageLengthOfCycle(cycles);

  const dateOfFinish = addDays(startOfDay(new Date(startDate)), cycleLength);
  const now = startOfToday();
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

export function getDayOfCycle(cycles: Cycle[]) {
  if (cycles.length === 0) {
    return 0;
  }

  const start = startOfDay(new Date(cycles[0].startDate));
  const currentDate = startOfToday();

  return differenceInDays(currentDate, start) + 1;
}

export function getPhase(cycles: Cycle[]) {
  const lengthOfCycle = getAverageLengthOfCycle(cycles);
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

  const ovulationDay = lengthOfCycle - lutealPhaseLength;

  if (currentDay <= lengthOfPeriod) {
    return phases.menstrual;
  }
  if (currentDay <= ovulationDay - ovulationOnError) {
    return phases.follicular;
  }
  if (currentDay <= ovulationDay + ovulationOnError) {
    return phases.ovulation;
  }
  return phases.luteal;
}

export function getAverageLengthOfCycle(cycles: Cycle[]) {
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

export function getAverageLengthOfPeriod(cycles: Cycle[]) {
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

export function getNewCyclesHistory(periodDays: string[]) {
  if (periodDays.length === 0) {
    return [];
  }

  periodDays.sort();
  const newCycles: Cycle[] = [
    {
      cycleLength: 28,
      periodLength: 1,
      startDate: periodDays[0],
    },
  ];
  for (let i = 1; i < periodDays.length; i++) {
    const date = startOfDay(new Date(periodDays[i]));
    const prevDate = startOfDay(new Date(periodDays[i - 1]));
    const diffInDays = differenceInDays(date, prevDate);

    if (diffInDays <= 1) {
      newCycles[0].periodLength++;
    } else if (diffInDays <= 2) {
      newCycles[0].periodLength += 2;
    } else {
      newCycles[0].cycleLength = diffInDays + newCycles[0].periodLength - 1;
      newCycles.unshift({
        cycleLength: 0,
        periodLength: 1,
        startDate: periodDays[i],
      });
    }
  }

  return newCycles;
}

export function getLastPeriodDays(cycles: Cycle[]) {
  const periodDays: string[] = [];

  for (const cycle of cycles) {
    const startOfCycle = startOfDay(new Date(cycle.startDate));

    for (let i = 0; i < cycle.periodLength; i++) {
      const newDate = addDays(startOfCycle, i);
      periodDays.push(format(newDate, "yyyy-MM-dd"));
    }
  }
  return periodDays;
}

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

export function getPastFuturePeriodDays(cycles: Cycle[]) {
  const nowDate = startOfToday();
  const periodDates = getLastPeriodDays(cycles);
  const lengthOfPeriod = getAverageLengthOfPeriod(cycles);

  if (cycles.length !== 0) {
    const endOfCurrentCycle = addDays(
      startOfDay(new Date(cycles[0].startDate)),
      cycles[0].periodLength,
    );
    if (endOfCurrentCycle >= nowDate) {
      return [];
    }
  }

  for (let day = 0; day < (lengthOfPeriod || 5); day++) {
    const periodDay = addDays(nowDate, day);
    periodDates.push(format(periodDay, "yyyy-MM-dd"));
  }

  return periodDates;
}

export function isForecastPeriodDays(date: Date, cycles: Cycle[]) {
  const lengthOfCycle = getAverageLengthOfCycle(cycles);
  const lengthOfPeriod = getAverageLengthOfPeriod(cycles);
  const nowDate = startOfToday();
  date = startOfDay(date);

  if (date <= nowDate) {
    return false;
  }

  const nextCycleStart = addDays(
    startOfDay(new Date(cycles[0].startDate)),
    lengthOfCycle,
  );
  const nextCycleFinish = addDays(
    startOfDay(new Date(cycles[0].startDate)),
    lengthOfCycle + lengthOfPeriod - 1,
  );

  if (date >= nextCycleStart && date < nextCycleFinish) {
    return true;
  }

  const delayDate = addDays(startOfToday(), lengthOfPeriod - 1);
  const dayOfCycle = getDayOfCycle(cycles);

  if (dayOfCycle > lengthOfCycle && date <= delayDate) {
    return true;
  }

  return false;
}

export function isForecastPeriodToday(date: Date, cycles: Cycle[]) {
  const lengthOfCycle = getAverageLengthOfCycle(cycles);
  const nowDate = startOfToday();

  const nextCycleStart = new Date(cycles[0].startDate);
  nextCycleStart.setDate(nextCycleStart.getDate() + lengthOfCycle);

  if (date.getTime() === nowDate.getTime() && date >= nextCycleStart) {
    return true;
  }

  return false;
}

export function isPeriodToday(cycles: Cycle[]) {
  if (cycles.length === 0) {
    return false;
  }

  const dayOfCycle = getDayOfCycle(cycles);

  return dayOfCycle <= cycles[0].periodLength;
}
