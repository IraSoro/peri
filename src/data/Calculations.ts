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

export const phases: string[][] = [
  ["The menstrual cycle can be divided into 4 phases.", "When information about your cycle appears, it will be reported which phase you are in."],
  ["Menstrual phase", "This cycle is accompanied by low hormone levels."],
  ["Follicular phase", "The level of estrogen in this phase rises and reaches a maximum level."],
  ["Ovulation phase", "Once estrogen levels peak, they trigger the release of two important ovulation hormones, follicle-stimulating hormone and luteinizing hormone."],
  ["Luteal phase", "Levels of the hormones estrogen and progesterone first rise and then drop sharply just before a period. Progesterone reaches its peak in the luteal phase."],
];

export interface InfoPhase {
  phaseTitle: string[];
  symptoms: number;
}

const getCurrentCycleDayNum = (date: string) => {
  const msInDay = 24 * 60 * 60 * 1000;

  let date1: Date = new Date(date);
  let now: Date = new Date();
  let currentDay = Math.ceil(Math.abs(Number(now) - Number(date1)) / msInDay);

  return currentDay;
}

export const getPhase = (cycle: CycleData, cycleLen: number = 28) => {
  let info: InfoPhase = { phaseTitle: phases[0], symptoms: 0 };
  if (cycle.startDate === "") {
    return info;
  }

  const currentDay: number = getCurrentCycleDayNum(cycle.startDate);
  const periodLen = cycle.lenPeriod;
  const follicularPhase: number = cycleLen - 14;

  if (currentDay <= periodLen) {
    info.phaseTitle = phases[1];
    info.symptoms = 1;
  } else if (currentDay <= (follicularPhase - 2)) {
    info.phaseTitle = phases[2];
    info.symptoms = 2;
  } else if (currentDay <= (follicularPhase + 2)) {
    info.phaseTitle = phases[3];
    info.symptoms = 3;
  } else {
    info.phaseTitle = phases[4];
    info.symptoms = 4;
  }

  return info;
}

export const getInfo = (date: string, cycleLen: number = 28) => {
  let info: InfoCurrentCycle = {
    cycleDay: "",
    ovulationDay: "",
    pregnantChance: "",
    periodIn: "no info",
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
    return "";
  }
  const msInDay = 24 * 60 * 60 * 1000;

  let date1: Date = new Date(date);
  let now: Date = new Date();
  let currentDay = Math.ceil(Math.abs(Number(now) - Number(date1)) / msInDay);

  return currentDay.toString();
}

const getOvulationDay = (currentDay: string, lenCycle: number) => {
  if (currentDay === "none" || lenCycle === 0) {
    return "";
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
    return "";
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

//----------------------------------------
// func for details tab
// - for all progress bars
export const getLenCycle = (idx: number, cycles?: CycleData[]) => {
  if (!cycles || idx >= cycles.length) {
    return "Cycle length";
  }
  return cycles[idx].lenCycle + " Days";
}

export const getLenProgressBar = (idx: number, cycles?: CycleData[]) => {
  if (!cycles || idx >= cycles.length) {
    return 30;
  }
  return cycles[idx].lenCycle;
}

export const getLenPeriod = (idx: number, cycles?: CycleData[]) => {
  if (!cycles || idx >= cycles.length) {
    return 0;
  }
  return cycles[idx].lenPeriod;
}

export const getDates = (idx: number, cycles?: CycleData[]) => {
  if (!cycles || idx >= cycles.length) {
    return "date";
  }

  let date: Date = new Date(cycles[idx].startDate);
  date.setDate(date.getDate() + Number(cycles[idx].lenCycle));

  return new Date(cycles[idx].startDate).toLocaleDateString() + " - " + date.toLocaleDateString();
}

// - for current current (first) progress bar
export const getCycleDay = (start_date: string) => {
  if (start_date === "none") {
    return 30;
  }
  const day: number = Number(getCurrentCycleDay(start_date));
  return day;
}

export const getTitleCycleDay = (start_date: string) => {
  if (start_date === "none") {
    return "Cycle days";
  }
  const day: string = getCurrentCycleDay(start_date);
  if (day === "1")
    return "1 Day";
  return day + " Days";
}
