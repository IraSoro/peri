// import * as mockedIonicStorage from "@ionic/storage";
import { it, expect, vi } from "vitest";
import { Storage } from "@ionic/storage";

import { storage } from "../data/Storage";

it("setCycles", async () => {
  const storageSetSpy = vi
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
  it("There are no cycles in storage", async () => {
    const storageGetSpy = vi
      .spyOn(Storage.prototype, "get")
      .mockResolvedValueOnce(undefined);

    await expect(storage.get.cycles()).rejects.toThrow(
      "Can't find `cycles` in storage",
    );
    expect(storageGetSpy).toHaveBeenCalledWith("cycles");
  });

  it("Storage has cycles", async () => {
    const cycles = [
      {
        cycleLength: 28,
        periodLength: 6,
        startDate: "2023-05-31",
      },
    ];

    const storageGetSpy = vi
      .spyOn(Storage.prototype, "get")
      .mockResolvedValueOnce(cycles);

    await expect(storage.get.cycles()).resolves.toBe(cycles);
    expect(storageGetSpy).toHaveBeenCalledWith("cycles");
  });
});

it("getCyclesUnsafe", async () => {
  const storageGetSpy = vi
    .spyOn(Storage.prototype, "get")
    .mockResolvedValueOnce(undefined);

  await expect(storage.getUnsafe.cycles()).resolves.toBe(undefined);
  expect(storageGetSpy).toHaveBeenCalledWith("cycles");
});

it("setLanguage", async () => {
  const storageSetSpy = vi
    .spyOn(Storage.prototype, "set")
    .mockResolvedValueOnce({});

  const language = "en";

  await storage.set.language(language);

  expect(storageSetSpy).toHaveBeenCalledWith("language", language);
});

describe("getLanguage", () => {
  it("There are no language in storage", async () => {
    const storageGetSpy = vi
      .spyOn(Storage.prototype, "get")
      .mockResolvedValueOnce(undefined);

    await expect(storage.get.language()).rejects.toThrow(
      "Can't find `language` in storage",
    );
    expect(storageGetSpy).toHaveBeenCalledWith("language");
  });

  it("Storage has language", async () => {
    const language = "en";

    const storageGetSpy = vi
      .spyOn(Storage.prototype, "get")
      .mockResolvedValueOnce(language);

    await expect(storage.get.language()).resolves.toBe(language);
    expect(storageGetSpy).toHaveBeenCalledWith("language");
  });
});

it("getLanguageUnsafe", async () => {
  const storageGetSpy = vi
    .spyOn(Storage.prototype, "get")
    .mockResolvedValueOnce(undefined);

  await expect(storage.getUnsafe.language()).resolves.toBe(undefined);
  expect(storageGetSpy).toHaveBeenCalledWith("language");
});
