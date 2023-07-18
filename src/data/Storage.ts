import { Storage, Drivers } from "@ionic/storage";
import type { Cycle } from "./ClassCycle";

export interface Context {
  cycles: Cycle[];
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
  return storageImpl.set("cycles", cycles);
}

async function getCycles(safe: boolean): Promise<Cycle[]> {
  const value = (await storageImpl.get("cycles")) as Cycle[];
  if (safe && !value) {
    throw new Error("Can't find `cycles` in storage");
  }
  return value;
}

export const storage = {
  set: {
    cycles: setCycles,
  },
  get: {
    cycles: () => getCycles(true),
  },
};

// NOTE: Predefined templates for test purpose
//       for use just uncomment one of the following lines:
// emptyArrayOfCycles().catch((err) => console.error(err));
// arrayOfCyclesWithSingleCycle().catch((err) => console.error(err));
// arrayOfCyclesWithSingleCycleWithDelay().catch((err) => console.error(err));
// halfFilledArrayOfCycles().catch((err) => console.error(err));
// fullyFilledArrayOfCycles().catch((err) => console.error(err));
// fullyFilledArrayOfCyclesWithDelay().catch((err) => console.error(err));

function emptyArrayOfCycles(): Promise<void> {
  return storageImpl.remove("cycles");
}

function arrayOfCyclesWithSingleCycle(): Promise<void> {
  return storage.set.cycles([
    {
      cycleLength: 28,
      periodLength: 6,
      startDate: "2023-06-30",
    },
  ] satisfies Cycle[]);
}

function arrayOfCyclesWithSingleCycleWithDelay(): Promise<void> {
  return storage.set.cycles([
    {
      cycleLength: 28,
      periodLength: 6,
      startDate: "2023-06-03",
    },
  ] satisfies Cycle[]);
}

function halfFilledArrayOfCycles(): Promise<void> {
  return storage.set.cycles([
    {
      cycleLength: 0,
      periodLength: 6,
      startDate: "2023-06-30",
    },
    {
      cycleLength: 28,
      periodLength: 6,
      startDate: "2023-06-03",
    },
    {
      cycleLength: 26,
      periodLength: 5,
      startDate: "2023-05-07",
    },
    {
      cycleLength: 25,
      periodLength: 6,
      startDate: "2023-04-13",
    },
  ] satisfies Cycle[]);
}

function fullyFilledArrayOfCycles(): Promise<void> {
  return storage.set.cycles([
    {
      cycleLength: 0,
      periodLength: 6,
      startDate: "2023-06-30",
    },
    {
      cycleLength: 28,
      periodLength: 6,
      startDate: "2023-06-03",
    },
    {
      cycleLength: 26,
      periodLength: 5,
      startDate: "2023-05-07",
    },
    {
      cycleLength: 25,
      periodLength: 6,
      startDate: "2023-04-13",
    },
    {
      cycleLength: 28,
      periodLength: 5,
      startDate: "2023-03-13",
    },
    {
      cycleLength: 28,
      periodLength: 5,
      startDate: "2023-02-16",
    },
    {
      cycleLength: 30,
      periodLength: 6,
      startDate: "2022-01-17",
    },
  ] satisfies Cycle[]);
}

function fullyFilledArrayOfCyclesWithDelay(): Promise<void> {
  return storage.set.cycles([
    {
      cycleLength: 0,
      periodLength: 6,
      startDate: "2023-06-03",
    },
    {
      cycleLength: 26,
      periodLength: 5,
      startDate: "2023-05-07",
    },
    {
      cycleLength: 25,
      periodLength: 6,
      startDate: "2023-04-13",
    },
    {
      cycleLength: 28,
      periodLength: 5,
      startDate: "2023-03-13",
    },
    {
      cycleLength: 28,
      periodLength: 5,
      startDate: "2023-02-16",
    },
    {
      cycleLength: 30,
      periodLength: 6,
      startDate: "2022-01-17",
    },
  ] as Cycle[]);
}
