import { it, expect, vi, describe } from "vitest";
import { Preferences } from "@capacitor/preferences";
import { storage, StorageKey } from "../data/Storage";

vi.mock("@capacitor/preferences", () => {
  return {
    Preferences: {
      set: vi.fn(),
      get: vi.fn(),
    },
  };
});

it("setCycles", async () => {
  console.log(Preferences);
  const preferencesSetSpy = vi
    .spyOn(Preferences, "set")
    .mockResolvedValueOnce();

  const cycles = [
    {
      cycleLength: 28,
      periodLength: 6,
      startDate: "2023-05-31",
    },
  ];

  await storage.set.cycles(cycles);
  expect(preferencesSetSpy).toHaveBeenCalledWith({
    key: StorageKey.Cycles,
    value: JSON.stringify(cycles),
  });
});

describe("getCycles", () => {
  it("There are no cycles in storage", async () => {
    const preferencesGetSpy = vi
      .spyOn(Preferences, "get")
      .mockResolvedValueOnce({ value: null });

    await expect(storage.get.cycles()).rejects.toThrow(
      "Can't find 'cycles' in storage",
    );
    expect(preferencesGetSpy).toHaveBeenCalledWith({ key: StorageKey.Cycles });
  });

  it("Storage has cycles", async () => {
    const cycles = [
      {
        cycleLength: 28,
        periodLength: 6,
        startDate: "2023-05-31",
      },
    ];

    const preferencesGetSpy = vi
      .spyOn(Preferences, "get")
      .mockResolvedValueOnce({ value: JSON.stringify(cycles) });

    await expect(storage.get.cycles()).resolves.toStrictEqual(cycles);
    expect(preferencesGetSpy).toHaveBeenCalledWith({ key: StorageKey.Cycles });
  });
});

it("getCyclesUnsafe", async () => {
  const preferencesGetSpy = vi
    .spyOn(Preferences, "get")
    .mockResolvedValueOnce({ value: null });

  await expect(storage.getUnsafe.cycles()).resolves.toBe(null);
  expect(preferencesGetSpy).toHaveBeenCalledWith({ key: StorageKey.Cycles });
});

it("setLanguage", async () => {
  const preferencesSetSpy = vi
    .spyOn(Preferences, "set")
    .mockResolvedValueOnce();

  const language = "en";

  await storage.set.language(language);

  expect(preferencesSetSpy).toHaveBeenCalledWith({
    key: StorageKey.Language,
    value: language,
  });
});

describe("getLanguage", () => {
  it("There are no language in storage", async () => {
    const preferencesGetSpy = vi
      .spyOn(Preferences, "get")
      .mockResolvedValueOnce({ value: null });

    await expect(storage.get.language()).rejects.toThrow(
      "Can't find 'language' in storage",
    );
    expect(preferencesGetSpy).toHaveBeenCalledWith({
      key: StorageKey.Language,
    });
  });

  it("Storage has language", async () => {
    const language = "en";

    const preferencesGetSpy = vi
      .spyOn(Preferences, "get")
      .mockResolvedValueOnce({ value: language });

    await expect(storage.get.language()).resolves.toBe(language);
    expect(preferencesGetSpy).toHaveBeenCalledWith({
      key: StorageKey.Language,
    });
  });
});

it("getLanguageUnsafe", async () => {
  const preferencesGetSpy = vi
    .spyOn(Preferences, "get")
    .mockResolvedValueOnce({ value: null });

  await expect(storage.getUnsafe.language()).resolves.toBe(null);
  expect(preferencesGetSpy).toHaveBeenCalledWith({ key: StorageKey.Language });
});
