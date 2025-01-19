import { Storage, Drivers } from "@ionic/storage";
import { addDays, startOfToday, subDays } from "date-fns";
import type { Cycle } from "./ClassCycle";
import { getAverageLengthOfPeriod } from "../state/CalculationLogics";

export interface Context {
  cycles: Cycle[];
  language: string;
  theme: string;
}

const storageImpl = new Storage({
  name: "PeriodDB",
  driverOrder: [Drivers.IndexedDB, Drivers.LocalStorage],
});

storageImpl
  .create()
  .then(() => console.log("Storage created"))
  .catch((err) =>
    console.error(`Can't create storage ${(err as Error).message}`),
  );

function setCycles(cycles: Cycle[]): Promise<void> {
  return storageImpl.set("cycles", cycles) as Promise<void>;
}

async function getCycles(safe: boolean): Promise<Cycle[]> {
  const value = (await storageImpl.get("cycles")) as Cycle[];
  if (safe && !value) {
    throw new Error("Can't find `cycles` in storage");
  }
  return value;
}

function setLanguage(language: string): Promise<void> {
  return storageImpl.set("language", language) as Promise<void>;
}

async function getLanguage(safe: boolean): Promise<string> {
  const value = (await storageImpl.get("language")) as string;
  if (safe && !value) {
    throw new Error("Can't find `language` in storage");
  }
  return value;
}

function setTheme(theme: string): Promise<void> {
  return storageImpl.set("theme", theme) as Promise<void>;
}

async function getTheme(safe: boolean): Promise<string> {
  const value = (await storageImpl.get("theme")) as string;
  if (safe && !value) {
    throw new Error("Can't find `theme` in storage");
  }
  return value;
}

export const storage = {
  set: {
    cycles: setCycles,
    language: setLanguage,
    theme: setTheme,
  },
  get: {
    cycles: () => getCycles(true),
    language: () => getLanguage(true),
    theme: () => getTheme(true),
  },
  getUnsafe: {
    cycles: () => getCycles(false),
    language: () => getLanguage(false),
    theme: () => getTheme(false),
  },
};

// NOTE: Predefined templates for test purpose
//       for use just uncomment one of the following lines:

// _emptyArrayOfCycles().catch((err) => console.error(err));
// _todayPeriod(8).catch((err) => console.error(err));
// _todayOvulation(8).catch((err) => console.error(err));
// _tomorrowOvulation(8).catch((err) => console.error(err));
// _menstrualPhase(8).catch((err) => console.error(err));
// _follicularPhase(8).catch((err) => console.error(err));
// _lutealPhase(8).catch((err) => console.error(err));
// _delayOfCycle(8).catch((err) => console.error(err));
// _randomMenstrualPhase(8).catch((err) => console.error(err));
// _randomFollicularPhase(8).catch((err) => console.error(err));
_randomLutealPhase(8).catch((err) => console.error(err));
// _randomDelayOfCycle(8).catch((err) => console.error(err));

function _emptyArrayOfCycles(): Promise<void> {
  return storageImpl.remove("cycles") as Promise<void>;
}

function _todayPeriod(countOfCycles: number): Promise<void> {
  const cycles: Cycle[] = [];
  let date = startOfToday();

  for (let i = 0; i < countOfCycles; i++) {
    date = subDays(date, 28);

    cycles.push({
      cycleLength: 28,
      periodLength: 6,
      startDate: date.toString(),
    });
  }

  if (countOfCycles > 1) {
    cycles[0].cycleLength = 0;
  }

  return storage.set.cycles(cycles);
}

function _todayOvulation(countOfCycles: number): Promise<void> {
  const cycles: Cycle[] = [];
  let date = addDays(startOfToday(), 15);

  for (let i = 0; i < countOfCycles; i++) {
    date = subDays(date, 28);
    cycles.push({
      cycleLength: 28,
      periodLength: 6,
      startDate: date.toString(),
    });
  }

  if (countOfCycles > 1) {
    cycles[0].cycleLength = 0;
  }

  return storage.set.cycles(cycles);
}

function _tomorrowOvulation(countOfCycles: number): Promise<void> {
  const cycles: Cycle[] = [];
  let date = addDays(startOfToday(), 16);

  for (let i = 0; i < countOfCycles; ++i) {
    date = subDays(date, 28);
    cycles.push({
      cycleLength: 28,
      periodLength: 6,
      startDate: date.toString(),
    });
  }

  if (countOfCycles > 1) {
    cycles[0].cycleLength = 0;
  }

  return storage.set.cycles(cycles);
}

function _menstrualPhase(countOfCycles: number): Promise<void> {
  const cycles: Cycle[] = [];
  let date = addDays(startOfToday(), 25);

  for (let i = 0; i < countOfCycles; i++) {
    date = subDays(date, 28);
    cycles.push({
      cycleLength: 28,
      periodLength: 6,
      startDate: date.toString(),
    });
  }

  if (countOfCycles > 1) {
    cycles[0].cycleLength = 0;
  }

  return storage.set.cycles(cycles);
}

function _follicularPhase(countOfCycles: number): Promise<void> {
  const cycles: Cycle[] = [];
  let date = addDays(startOfToday(), 20);

  for (let i = 0; i < countOfCycles; ++i) {
    date = subDays(date, 28);
    cycles.push({
      cycleLength: 28,
      periodLength: 6,
      startDate: date.toString(),
    });
  }

  if (countOfCycles > 1) {
    cycles[0].cycleLength = 0;
  }

  return storage.set.cycles(cycles);
}

function _lutealPhase(countOfCycles: number): Promise<void> {
  const cycles: Cycle[] = [];
  let date = addDays(startOfToday(), 10);

  for (let i = 0; i < countOfCycles; ++i) {
    date = subDays(date, 28);
    cycles.push({
      cycleLength: 28,
      periodLength: 6,
      startDate: date.toString(),
    });
  }

  if (countOfCycles > 1) {
    cycles[0].cycleLength = 0;
  }

  return storage.set.cycles(cycles);
}

function _delayOfCycle(countOfCycles: number): Promise<void> {
  const cycles: Cycle[] = [];
  let date = subDays(startOfToday(), 5);

  for (let i = 0; i < countOfCycles; ++i) {
    date = subDays(date, 28);
    cycles.push({
      cycleLength: 28,
      periodLength: 6,
      startDate: date.toString(),
    });
  }

  if (countOfCycles > 1) {
    cycles[0].cycleLength = 0;
  }

  return storage.set.cycles(cycles);
}

function random(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function _randomMenstrualPhase(countOfCycles: number): Promise<void> {
  const cycles: Cycle[] = [];
  let date: Date = addDays(startOfToday(), 26);

  for (let i = 0; i < countOfCycles; ++i) {
    const cycleLength = random(26, 30);
    date = subDays(date, cycleLength);
    cycles.push({
      cycleLength: cycleLength,
      periodLength: random(4, 6),
      startDate: date.toString(),
    });
  }

  if (countOfCycles > 1) {
    const averagePeriod = getAverageLengthOfPeriod(cycles);
    cycles[0].periodLength = averagePeriod;
    cycles[0].cycleLength = 0;
  }

  return storage.set.cycles(cycles);
}

function _randomFollicularPhase(countOfCycles: number): Promise<void> {
  const cycles: Cycle[] = [];
  let date = addDays(startOfToday(), 20);

  for (let i = 0; i < countOfCycles; ++i) {
    const cycleLength = random(26, 30);
    date = subDays(date, cycleLength);
    cycles.push({
      cycleLength: cycleLength,
      periodLength: random(4, 6),
      startDate: date.toString(),
    });
  }

  if (countOfCycles > 1) {
    const averagePeriod = getAverageLengthOfPeriod(cycles);
    cycles[0].periodLength = averagePeriod;
    cycles[0].cycleLength = 0;
  }

  return storage.set.cycles(cycles);
}

function _randomLutealPhase(countOfCycles: number): Promise<void> {
  const cycles: Cycle[] = [];
  let date = addDays(startOfToday(), 10);

  for (let i = 0; i < countOfCycles; ++i) {
    const cycleLength = random(26, 30);
    date = subDays(date, cycleLength);
    cycles.push({
      cycleLength: cycleLength,
      periodLength: random(4, 6),
      startDate: date.toString(),
    });
  }

  if (countOfCycles > 1) {
    const averagePeriod = getAverageLengthOfPeriod(cycles);
    cycles[0].periodLength = averagePeriod;
    cycles[0].cycleLength = 0;
  }

  return storage.set.cycles(cycles);
}

function _randomDelayOfCycle(countOfCycles: number): Promise<void> {
  const cycles: Cycle[] = [];
  let date = subDays(startOfToday(), 5);

  for (let i = 0; i < countOfCycles; ++i) {
    const cycleLength = random(26, 30);
    date = subDays(date, cycleLength);
    cycles.push({
      cycleLength: cycleLength,
      periodLength: random(4, 6),
      startDate: date.toString(),
    });
  }

  if (countOfCycles > 1) {
    const averagePeriod = getAverageLengthOfPeriod(cycles);
    cycles[0].periodLength = averagePeriod;
    cycles[0].cycleLength = 0;
  }

  return storage.set.cycles(cycles);
}
