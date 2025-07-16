import { Storage, Drivers } from "@ionic/storage";
import { Preferences } from "@capacitor/preferences";
import { addDays, startOfToday, subDays } from "date-fns";
import type { Cycle } from "./Cycle";
import { getAverageLengthOfPeriod } from "../state/CalculationLogics";

export interface Context {
  cycles: Cycle[];
  language: string;
  theme: string;
  isNotifications: boolean;
  lastNotificationId: number;
  maxNumberOfDisplayedCycles: number;
}

export enum StorageKey {
  Cycles = "cycles",
  Language = "language",
  Theme = "theme",
  isNotifications = "isNotifications",
  LastNotificationId = "lastNotificationId",
  MaxNumberOfDisplayedCycles = "maxNumberOfDisplayedCycles",
}

type StorageValueTypeMap = {
  [StorageKey.Cycles]: Cycle[];
  [StorageKey.Language]: string;
  [StorageKey.Theme]: string;
  [StorageKey.isNotifications]: boolean;
  [StorageKey.LastNotificationId]: number;
  [StorageKey.MaxNumberOfDisplayedCycles]: number;
};

type StorageValueType<K extends StorageKey> = StorageValueTypeMap[K];

const storageImplOld = new Storage({
  name: "PeriodDB",
  driverOrder: [Drivers.IndexedDB, Drivers.LocalStorage],
});

storageImplOld
  .create()
  .then(() => console.log("Storage created"))
  .catch((err) =>
    console.error(`Can't create storage ${(err as Error).message}`),
  );

function createStorageSetterOld<Key extends StorageKey>(storageKey: Key) {
  return (value: StorageValueType<Key>) => {
    return storageImplOld.set(storageKey, value) as Promise<void>;
  };
}

function createStorageGetterOld<Key extends StorageKey>(
  storageKey: Key,
  safe: boolean,
) {
  return async () => {
    const value = (await storageImplOld.get(
      storageKey,
    )) as StorageValueType<Key>;
    if (safe && !value) {
      throw new Error(`Can't find '${storageKey}' in storage`);
    }
    return value;
  };
}

export const storage = {
  set: {
    cycles: (value: StorageValueType<StorageKey.Cycles>) => {
      return Preferences.set({
        key: StorageKey.Cycles,
        value: JSON.stringify(value),
      });
    },
    language: (value: StorageValueType<StorageKey.Language>) => {
      return Preferences.set({
        key: StorageKey.Language,
        value: value,
      });
    },
    theme: (value: StorageValueType<StorageKey.Theme>) => {
      return Preferences.set({
        key: StorageKey.Theme,
        value: value,
      });
    },
    isNotifications: (value: StorageValueType<StorageKey.isNotifications>) => {
      return Preferences.set({
        key: StorageKey.isNotifications,
        value: value.toString(),
      });
    },
    lastNotificationId: (
      value: StorageValueType<StorageKey.LastNotificationId>,
    ) => {
      return Preferences.set({
        key: StorageKey.LastNotificationId,
        value: value.toString(),
      });
    },
    maxNumberOfDisplayedCycles: (
      value: StorageValueType<StorageKey.MaxNumberOfDisplayedCycles>,
    ) => {
      return Preferences.set({
        key: StorageKey.MaxNumberOfDisplayedCycles,
        value: value.toString(),
      });
    },
  },
  get: {
    cycles: async () => {
      const { value } = await Preferences.get({ key: StorageKey.Cycles });
      if (!value) {
        throw new Error(`Can't find '${StorageKey.Cycles}' in storage`);
      }
      return JSON.parse(value) as StorageValueType<StorageKey.Cycles>;
    },
    language: async () => {
      const { value } = await Preferences.get({ key: StorageKey.Language });
      if (!value) {
        throw new Error(`Can't find '${StorageKey.Language}' in storage`);
      }
      return value;
    },
    theme: async () => {
      const { value } = await Preferences.get({ key: StorageKey.Theme });
      if (!value) {
        throw new Error(`Can't find '${StorageKey.Theme}' in storage`);
      }
      return value;
    },
    isNotifications: async () => {
      const { value } = await Preferences.get({
        key: StorageKey.isNotifications,
      });
      if (!value) {
        throw new Error(
          `Can't find '${StorageKey.isNotifications}' in storage`,
        );
      }
      return value === "true";
    },
    lastNotificationId: async () => {
      const { value } = await Preferences.get({
        key: StorageKey.LastNotificationId,
      });
      if (!value) {
        throw new Error(
          `Can't find '${StorageKey.LastNotificationId}' in storage`,
        );
      }
      return Number(value);
    },
    maxNumberOfDisplayedCycles: async () => {
      const { value } = await Preferences.get({
        key: StorageKey.MaxNumberOfDisplayedCycles,
      });
      if (!value) {
        throw new Error(
          `Can't find '${StorageKey.MaxNumberOfDisplayedCycles}' in storage`,
        );
      }
      return Number(value);
    },
  },
  getUnsafe: {
    cycles: async () => {
      const { value } = await Preferences.get({ key: StorageKey.Cycles });
      return value
        ? (JSON.parse(value) as StorageValueType<StorageKey.Cycles>)
        : null;
    },
    language: async () => {
      const { value } = await Preferences.get({ key: StorageKey.Language });
      return value;
    },
    theme: async () => {
      const { value } = await Preferences.get({ key: StorageKey.Theme });
      return value;
    },
  },
  old: {
    set: {
      cycles: createStorageSetterOld(StorageKey.Cycles),
      language: createStorageSetterOld(StorageKey.Language),
      theme: createStorageSetterOld(StorageKey.Theme),
    },
    get: {
      cycles: createStorageGetterOld(StorageKey.Cycles, true),
      language: createStorageGetterOld(StorageKey.Language, true),
      theme: createStorageGetterOld(StorageKey.Theme, true),
    },
    getUnsafe: {
      cycles: createStorageGetterOld(StorageKey.Cycles, false),
      language: createStorageGetterOld(StorageKey.Language, false),
      theme: createStorageGetterOld(StorageKey.Theme, false),
    },
  },
};

export async function migrateToTheNewStorage() {
  if (!(await storageImplOld.length())) {
    return;
  }
  if (!(await storage.getUnsafe.cycles())) {
    const cycles = await storage.old.getUnsafe.cycles();
    if (cycles.length) {
      await storage.set.cycles(cycles);
    }
  }
  if (!(await storage.getUnsafe.language())) {
    const language = await storage.old.getUnsafe.language();
    if (language.length) {
      await storage.set.language(language);
    }
  }
  if (!(await storage.getUnsafe.theme())) {
    const theme = await storage.old.getUnsafe.theme();
    if (theme.length) {
      await storage.set.theme(theme);
    }
  }

  await storageImplOld.clear();
  console.log(
    "Migration from '@ionic/storage' to '@capacitor/preferences' completed",
  );
}

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
// _randomLutealPhase(8).catch((err) => console.error(err));
// _randomDelayOfCycle(8).catch((err) => console.error(err));

function _emptyArrayOfCycles() {
  return Preferences.remove({
    key: StorageKey.Cycles,
  });
}

function _todayPeriod(countOfCycles: number) {
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

function _todayOvulation(countOfCycles: number) {
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

function _tomorrowOvulation(countOfCycles: number) {
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

function _menstrualPhase(countOfCycles: number) {
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

function _follicularPhase(countOfCycles: number) {
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

function _lutealPhase(countOfCycles: number) {
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

function _delayOfCycle(countOfCycles: number) {
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

function _randomMenstrualPhase(countOfCycles: number) {
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
    const averagePeriod = getAverageLengthOfPeriod(cycles, countOfCycles - 2);
    cycles[0].periodLength = averagePeriod;
    cycles[0].cycleLength = 0;
  }

  return storage.set.cycles(cycles);
}

function _randomFollicularPhase(countOfCycles: number) {
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
    const averagePeriod = getAverageLengthOfPeriod(cycles, countOfCycles - 2);
    cycles[0].periodLength = averagePeriod;
    cycles[0].cycleLength = 0;
  }

  return storage.set.cycles(cycles);
}

function _randomLutealPhase(countOfCycles: number) {
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
    const averagePeriod = getAverageLengthOfPeriod(cycles, countOfCycles - 2);
    cycles[0].periodLength = averagePeriod;
    cycles[0].cycleLength = 0;
  }

  return storage.set.cycles(cycles);
}

function _randomDelayOfCycle(countOfCycles: number) {
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
    const averagePeriod = getAverageLengthOfPeriod(cycles, countOfCycles - 2);
    cycles[0].periodLength = averagePeriod;
    cycles[0].cycleLength = 0;
  }

  return storage.set.cycles(cycles);
}
