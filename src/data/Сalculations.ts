export interface InfoCycle {
  cycleDay: string;
  ovulationDay: string;
  pregnantChance: string;
}

export const getInfo = (date: string, cycleLen: number) => {
  let info: InfoCycle = {
    cycleDay: "none",
    ovulationDay: "none",
    pregnantChance: "none"
  };

  info.cycleDay = getCurrentCycleDay(date);
  info.ovulationDay = getOvulationDay(info.cycleDay, cycleLen);
  info.pregnantChance = getPregnantChance(info.cycleDay, cycleLen);

  return info;
}

const getCurrentCycleDay = (date: string) => {
  const msInDay = 24 * 60 * 60 * 1000;

  let date1: Date = new Date(date);
  let now: Date = new Date();
  let currentDay = Math.round(Math.abs(Number(now) - Number(date1)) / msInDay);

  return currentDay.toString();
}

const getOvulationDay = (currentDay: string, lenCycle: number) => {
  if (currentDay === "none" || lenCycle === 0) {
    return "none";
  }
  const curDay: number = Number(currentDay);
  const ovulationDay = lenCycle - 14;
  const diffDay = ovulationDay - curDay;
  if (diffDay === 0) {
    return "today";
  } else if (diffDay < 0) {
    return "was";
  } else if (diffDay === 1) {
    return "tomorrow"
  }
  return "in " + diffDay + " days";
}

const getPregnantChance = (currentDay: string, lenCycle: number) => {
  if (currentDay === "none" || lenCycle === 0) {
    return "none";
  }

  const curDay: number = Number(currentDay);
  const ovulationDay = lenCycle - 14;
  const diffDay = ovulationDay - curDay;

  if (diffDay >= -1 && diffDay <= 1){
    return "high";
  } else if (diffDay >= -2 && diffDay <= 2) {
    return "middle";
  } else {
    return "low";
  }
}
