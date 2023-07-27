import i18n from "i18next";

const millisecondsInDay = 24 * 60 * 60 * 1000;

export function getOvulationStatus(cycleLength: number, dayOfCycle: number) {
  if (!cycleLength || !dayOfCycle) {
    return "";
  }

  const lutealPhaseLength = 14;
  const ovulationDay = Number(cycleLength) - lutealPhaseLength;
  const diffDay = ovulationDay - dayOfCycle;
  if (diffDay === 0) {
    return i18n.t("today");
  } else if (diffDay < 0 && diffDay >= -2) {
    return i18n.t("possible");
  } else if (diffDay < 0) {
    return i18n.t("finished");
  } else if (diffDay === 1) {
    return i18n.t("tomorrow");
  } else if (diffDay < 5) {
    return `${i18n.t("in")} ${diffDay} ${i18n.t("Days less 5")}`;
  }
  return `${i18n.t("in")} ${diffDay} ${i18n.t("Days")}`;
}

export function getPregnancyChance(cycleLength: number, dayOfCycle: number) {
  if (!cycleLength || !dayOfCycle) {
    return "";
  }

  const lutealPhaseLength = 14;
  const ovulationDay = Number(cycleLength) - lutealPhaseLength;
  const diffDay = ovulationDay - dayOfCycle;

  if (diffDay <= 4 && diffDay >= -2) {
    return i18n.t("high");
  }
  return i18n.t("low");
}

export function getDaysBeforePeriod(cycleLength: number, startDate: string) {
  if (!startDate || !cycleLength) {
    return {
      title: i18n.t("Period in"),
      days: i18n.t("no info"),
    };
  }

  const dateOfFinish = new Date(startDate);
  dateOfFinish.setDate(dateOfFinish.getDate() + Number(cycleLength));
  dateOfFinish.setHours(0, 0, 0, 0);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const dayBefore = Math.round(
    (Number(dateOfFinish) - Number(now)) / millisecondsInDay,
  );

  if (dayBefore > 1) {
    if (
      dayBefore < 5 ||
      (dayBefore > 20 && dayBefore % 10 > 0 && dayBefore % 10 < 5)
    ) {
      return {
        title: i18n.t("Period in"),
        days: `${dayBefore} ${i18n.t("Days less 5")}`,
      };
    }
    return {
      title: i18n.t("Period in"),
      days: `${dayBefore} ${i18n.t("Days")}`,
    };
  }
  if (dayBefore === 1) {
    return {
      title: i18n.t("Period in"),
      days: `1 ${i18n.t("Days")}`,
    };
  }
  if (dayBefore === 0) {
    return {
      title: i18n.t("Period"),
      days: i18n.t("today"),
    };
  }
  if (dayBefore === -1) {
    return {
      title: i18n.t("Delay"),
      days: `1 ${i18n.t("Day")}`,
    };
  }
  if (dayBefore > -5) {
    return {
      title: i18n.t("Delay"),
      days: `${dayBefore} ${i18n.t("Days less 5")}`,
    };
  }
  return {
    title: i18n.t("Delay"),
    days: `${Math.abs(dayBefore)} ${i18n.t("Days")}`,
  };
}

export function getDayOfCycle(startDate: string) {
  if (!startDate) {
    return "";
  }

  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  const diff =
    Math.ceil((currentDate.getTime() - start.getTime()) / millisecondsInDay) +
    1;

  return diff.toString();
}
