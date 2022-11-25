export interface MainProps {
  lenCycle: number;
  setLenCycle: (newIsOpen: number) => void;

  lenPeriod: number;
  setLenPeriod: (newIsOpen: number) => void;

  dateStartCycle: string;
  setDateStartCycle: (newDateStartCycle: string) => void;

  cycles?: CycleData[];
  setCycles: (newCycles: CycleData[]) => void;
}


export class CycleData {
  lenCycle: number = 0;
  lenPeriod: number = 0;
  startDate: string = "";

  constructor() {
    this.lenCycle = 0;
    this.lenPeriod = 0;
    this.startDate = "";
  }

  isEmpty(): boolean {
    if (!this.lenCycle || !this.lenPeriod || !this.startDate) {
      return true;
    }
    return false;
  }
}

export interface InfoCurrentCycle {
  cycleDay: string;
  ovulationDay: string;
  pregnantChance: string;
  periodIn: string;
  periodInTitle: string;
}

export const getInfo = (date: string, cycleLen: number = 25) => {
  let info: InfoCurrentCycle = {
    cycleDay: "none",
    ovulationDay: "none",
    pregnantChance: "none",
    periodIn: "none",
    periodInTitle: "Period in",
  };

  if (date === "none" || cycleLen === 0) {
    return info;
  }

  info.cycleDay = getCurrentCycleDay(date);
  info.ovulationDay = getOvulationDay(info.cycleDay, cycleLen);
  info.pregnantChance = getPregnantChance(info.cycleDay, cycleLen);
  info.periodIn = getPeriodIn(date, cycleLen);
  info.periodInTitle = getPeriodInTitle(date, cycleLen);

  return info;
}

export const getCurrentCycleDay = (date: string) => {
  if (date === "none") {
    return "none";
  }
  const msInDay = 24 * 60 * 60 * 1000;

  let date1: Date = new Date(date);
  let now: Date = new Date();
  let currentDay = Math.ceil(Math.abs(Number(now) - Number(date1)) / msInDay);

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

  if (diffDay >= -1 && diffDay <= 1) {
    return "high";
  } else if (diffDay >= -2 && diffDay <= 2) {
    return "middle";
  } else {
    return "low";
  }
}

const getPeriodIn = (date: string, lenCycle: number) => {
  const msInDay = 24 * 60 * 60 * 1000;

  let date1: Date = new Date(date);
  date1.setDate(date1.getDate() + Number(lenCycle));
  let now: Date = new Date();
  let dayBefore = Math.round((Number(date1) - Number(now)) / msInDay);

  if (dayBefore > 0) {
    return dayBefore + " Days";
  } else if (dayBefore === 0) {
    return "Today";
  }
  return Math.abs(dayBefore) + " Days";
}

const getPeriodInTitle = (date: string, lenCycle: number) => {
  const msInDay = 24 * 60 * 60 * 1000;

  let date1: Date = new Date(date);
  date1.setDate(date1.getDate() + Number(lenCycle));
  let now: Date = new Date();
  let dayBefore = Math.round((Number(date1) - Number(now)) / msInDay);

  if (dayBefore > 0) {
    return "Period in";
  } else if (dayBefore === 0) {
    return "Period";
  }
  return "Delay";
}
