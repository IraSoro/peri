// import * as mockedIonicStorage from "@ionic/storage";
import { Storage } from "@ionic/storage";

import { storage } from "../data/Storage";

test("setCycles", async () => {
  const storageSetSpy = jest
    .spyOn(Storage.prototype, "set")
    .mockResolvedValueOnce({});

  const cycles = [
    {
      cycleLength: 28,
      periodLength: 6,
      startDate: "2023-05-31",
    },
  ];

  await storage.set.cycles(cycles);

  expect(storageSetSpy).toHaveBeenCalledWith("cycles", cycles);
});

describe("getCycles", () => {
  test("There are no cycles in storage", async () => {
    const storageGetSpy = jest
      .spyOn(Storage.prototype, "get")
      .mockResolvedValueOnce(undefined);

    await expect(storage.get.cycles()).rejects.toThrow(
      "Can't find `cycles` in storage",
    );
    expect(storageGetSpy).toHaveBeenCalledWith("cycles");
  });

  test("Storage has cycles", async () => {
    const cycles = [
      {
        cycleLength: 28,
        periodLength: 6,
        startDate: "2023-05-31",
      },
    ];

    const storageGetSpy = jest
      .spyOn(Storage.prototype, "get")
      .mockResolvedValueOnce(cycles);

    await expect(storage.get.cycles()).resolves.toBe(cycles);
    expect(storageGetSpy).toHaveBeenCalledWith("cycles");
  });
});

test("getCyclesUnsafe", async () => {
  const storageGetSpy = jest
    .spyOn(Storage.prototype, "get")
    .mockResolvedValueOnce(undefined);

  await expect(storage.getUnsafe.cycles()).resolves.toBe(undefined);
  expect(storageGetSpy).toHaveBeenCalledWith("cycles");
});

test("setLanguage", async () => {
  const storageSetSpy = jest
    .spyOn(Storage.prototype, "set")
    .mockResolvedValueOnce({});

  const language = "en";

  await storage.set.language(language);

  expect(storageSetSpy).toHaveBeenCalledWith("language", language);
});

describe("getLanguage", () => {
  test("There are no language in storage", async () => {
    const storageGetSpy = jest
      .spyOn(Storage.prototype, "get")
      .mockResolvedValueOnce(undefined);

    await expect(storage.get.language()).rejects.toThrow(
      "Can't find `language` in storage",
    );
    expect(storageGetSpy).toHaveBeenCalledWith("language");
  });

  test("Storage has language", async () => {
    const language = "en";

    const storageGetSpy = jest
      .spyOn(Storage.prototype, "get")
      .mockResolvedValueOnce(language);

    await expect(storage.get.language()).resolves.toBe(language);
    expect(storageGetSpy).toHaveBeenCalledWith("language");
  });
});

test("getLanguageUnsafe", async () => {
  const storageGetSpy = jest
    .spyOn(Storage.prototype, "get")
    .mockResolvedValueOnce(undefined);

  await expect(storage.getUnsafe.language()).resolves.toBe(undefined);
  expect(storageGetSpy).toHaveBeenCalledWith("language");
});
