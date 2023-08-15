import { Storage, Drivers } from "@ionic/storage";
import type { Cycle } from "./ClassCycle";

export interface Context {
  cycles: Cycle[];
  // TODO: Add language
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

export const storage = {
  set: {
    cycles: setCycles,
    language: setLanguage,
  },
  get: {
    cycles: () => getCycles(true),
    language: () => getLanguage(true),
  },
  getUnsafe: {
    cycles: () => getCycles(false),
    language: () => getLanguage(false),
  },
};

// NOTE: Predefined templates for test purpose
//       for use just uncomment one of the following lines:

// _emptyArrayOfCycles().catch((err) => console.error(err));
// _todayPeriod(6).catch((err) => console.error(err));
// _todayOvulation(6).catch((err) => console.error(err));
// _tomorrowOvulation(6).catch((err) => console.error(err));
// _menstrualPhase(6).catch((err) => console.error(err));
// _follicularPhase(6).catch((err) => console.error(err));
// _lutealPhase(6).catch((err) => console.error(err));
// _delayOfCycle(6).catch((err) => console.error(err));

function _emptyArrayOfCycles(): Promise<void> {
  return storageImpl.remove("cycles") as Promise<void>;
}

function _todayPeriod(countOfCycles: number): Promise<void> {
  const date: Date = new Date();
  date.setHours(0, 0, 0, 0);

  const cycles: Cycle[] = [];

  for (let i = 0; i < countOfCycles; ++i) {
    date.setDate(date.getDate() - 28);
    cycles.push({
      cycleLength: 28,
      periodLength: 6,
      startDate: date.toString(),
    });
  }

  return storage.set.cycles(cycles);
}

function _todayOvulation(countOfCycles: number): Promise<void> {
  const date: Date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + 15);

  const cycles: Cycle[] = [];

  for (let i = 0; i < countOfCycles; ++i) {
    date.setDate(date.getDate() - 28);
    cycles.push({
      cycleLength: 28,
      periodLength: 6,
      startDate: date.toString(),
    });
  }

  return storage.set.cycles(cycles);
}

function _tomorrowOvulation(countOfCycles: number): Promise<void> {
  const date: Date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + 16);

  const cycles: Cycle[] = [];

  for (let i = 0; i < countOfCycles; ++i) {
    date.setDate(date.getDate() - 28);
    cycles.push({
      cycleLength: 28,
      periodLength: 6,
      startDate: date.toString(),
    });
  }

  return storage.set.cycles(cycles);
}

function _menstrualPhase(countOfCycles: number): Promise<void> {
  const date: Date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + 25);

  const cycles: Cycle[] = [];

  for (let i = 0; i < countOfCycles; ++i) {
    date.setDate(date.getDate() - 28);
    cycles.push({
      cycleLength: 28,
      periodLength: 6,
      startDate: date.toString(),
    });
  }

  return storage.set.cycles(cycles);
}

function _follicularPhase(countOfCycles: number): Promise<void> {
  const date: Date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + 20);

  const cycles: Cycle[] = [];

  for (let i = 0; i < countOfCycles; ++i) {
    date.setDate(date.getDate() - 28);
    cycles.push({
      cycleLength: 28,
      periodLength: 6,
      startDate: date.toString(),
    });
  }

  return storage.set.cycles(cycles);
}

function _lutealPhase(countOfCycles: number): Promise<void> {
  const date: Date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + 10);

  const cycles: Cycle[] = [];

  for (let i = 0; i < countOfCycles; ++i) {
    date.setDate(date.getDate() - 28);
    cycles.push({
      cycleLength: 28,
      periodLength: 6,
      startDate: date.toString(),
    });
  }

  return storage.set.cycles(cycles);
}

function _delayOfCycle(countOfCycles: number): Promise<void> {
  const date: Date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - 5);

  const cycles: Cycle[] = [];

  for (let i = 0; i < countOfCycles; ++i) {
    date.setDate(date.getDate() - 28);
    cycles.push({
      cycleLength: 28,
      periodLength: 6,
      startDate: date.toString(),
    });
  }

  return storage.set.cycles(cycles);
}
