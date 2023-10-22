import i18n from "i18next";
import { Cycle } from "../data/ClassCycle";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

const millisecondsInDay = 24 * 60 * 60 * 1000;

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

  const dateOfFinish = new Date(startDate);
  dateOfFinish.setDate(dateOfFinish.getDate() + cycleLength);
  dateOfFinish.setHours(0, 0, 0, 0);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const dayBefore = Math.round(
    (Number(dateOfFinish) - Number(now)) / millisecondsInDay,
  );

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

  const start = new Date(cycles[0].startDate);
  start.setHours(0, 0, 0, 0);
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  const diff =
    Math.ceil((currentDate.getTime() - start.getTime()) / millisecondsInDay) +
    1;

  return diff;
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
    const date = new Date(periodDays[i]);
    const prevDate = new Date(periodDays[i - 1]);
    const diffInDays = Math.abs(
      (date.getTime() - prevDate.getTime()) / millisecondsInDay,
    );

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
    const startOfCycle = new Date(cycle.startDate);
    startOfCycle.setHours(0, 0, 0, 0);

    for (let i = 0; i < cycle.periodLength; i++) {
      const newDate = new Date(startOfCycle);
      newDate.setDate(startOfCycle.getDate() + i);
      periodDays.push(format(newDate, "yyyy-MM-dd"));
    }
  }
  return periodDays;
}

export function getActiveDates(dateString: string, cycles: Cycle[]) {
  const date = new Date(dateString);
  date.setHours(0, 0, 0, 0);

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  if (cycles.length === 0) {
    return date <= now;
  }

  const endPeriod = new Date(cycles[0].startDate);
  endPeriod.setHours(0, 0, 0, 0);
  endPeriod.setDate(endPeriod.getDate() + cycles[0].periodLength - 1);

  return date <= endPeriod || date <= now;
}

export function getMarkModalActiveDates(dateString: string, cycles: Cycle[]) {
  if (cycles.length === 0) {
    return true;
  }

  const date = new Date(dateString);
  date.setHours(0, 0, 0, 0);

  const futureCycleFinish: Date = new Date(cycles[0].startDate);
  futureCycleFinish.setDate(
    futureCycleFinish.getDate() + cycles[0].periodLength - 1,
  );
  futureCycleFinish.setHours(0, 0, 0, 0);

  return date.getTime() > futureCycleFinish.getTime();
}

export function getPastFuturePeriodDays(cycles: Cycle[]) {
  const nowDate = new Date();
  nowDate.setHours(0, 0, 0, 0);

  const periodDates = getLastPeriodDays(cycles);
  const lengthOfPeriod = getAverageLengthOfPeriod(cycles);

  if (cycles.length !== 0) {
    const endOfCurrentCycle = new Date(cycles[0].startDate);
    endOfCurrentCycle.setDate(
      endOfCurrentCycle.getDate() + cycles[0].periodLength,
    );
    endOfCurrentCycle.setHours(0, 0, 0, 0);
    if (endOfCurrentCycle >= nowDate) {
      return [];
    }
  }

  for (let day = 0; day < (lengthOfPeriod || 5); day++) {
    const periodDay = new Date(nowDate);
    periodDay.setHours(0, 0, 0, 0);
    periodDay.setDate(periodDay.getDate() + day);

    periodDates.push(format(periodDay, "yyyy-MM-dd"));
  }

  return periodDates;
}

export function isForecastPeriodDays(date: Date, cycles: Cycle[]) {
  const lengthOfCycle = getAverageLengthOfCycle(cycles);
  const lengthOfPeriod = getAverageLengthOfPeriod(cycles);
  const nowDate = new Date();
  nowDate.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);

  if (date <= nowDate) {
    return false;
  }

  const nextCycleStart = new Date(cycles[0].startDate);
  nextCycleStart.setDate(nextCycleStart.getDate() + lengthOfCycle);
  const nextCycleFinish = new Date(cycles[0].startDate);
  nextCycleFinish.setDate(
    nextCycleFinish.getDate() + lengthOfCycle + lengthOfPeriod - 1,
  );

  if (date >= nextCycleStart && date < nextCycleFinish) {
    return true;
  }

  const delayDate = new Date();
  delayDate.setHours(0, 0, 0, 0);
  delayDate.setDate(delayDate.getDate() + lengthOfPeriod - 1);

  const dayOfCycle = getDayOfCycle(cycles);

  if (dayOfCycle > lengthOfCycle && date <= delayDate) {
    return true;
  }

  return false;
}

export function isForecastPeriodToday(date: Date, cycles: Cycle[]) {
  const lengthOfCycle = getAverageLengthOfCycle(cycles);
  const nowDate = new Date();
  nowDate.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);

  const nextCycleStart = new Date(cycles[0].startDate);
  nextCycleStart.setDate(nextCycleStart.getDate() + lengthOfCycle);

  if (date.getTime() === nowDate.getTime() && date >= nextCycleStart) {
    return true;
  }

  return false;
}

export function getFormattedDate(date: Date, language: string) {
  const formattedDates = new Map<string, string>([
    ["en-GB", format(date, "MMM d")],
    [
      "ru",
      format(date, "d MMMM", {
        locale: ru,
      }),
    ],
  ]);
  return formattedDates.get(language) ?? format(date, "MMM d");
}

export function isPeriodToday(cycles: Cycle[]) {
  if (cycles.length === 0) {
    return false;
  }

  const nowDate = new Date();
  nowDate.setHours(0, 0, 0, 0);

  const dayOfCycle = getDayOfCycle(cycles);

  return dayOfCycle <= cycles[0].periodLength;
}
