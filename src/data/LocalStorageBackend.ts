import { Preferences } from "@capacitor/preferences";
import type { Cycle } from "./ICycle";
import type { StorageBackend } from "./types";
import { StorageKey } from "./Storage";

export class LocalStorageBackend implements StorageBackend {
  // Cycles
  async getCycles(): Promise<Cycle[]> {
    const { value } = await Preferences.get({ key: StorageKey.Cycles });
    if (!value) {
      throw new Error(`Can't find '${StorageKey.Cycles}' in storage`);
    }
    return JSON.parse(value) as Cycle[];
  }

  async setCycles(cycles: Cycle[]): Promise<void> {
    await Preferences.set({
      key: StorageKey.Cycles,
      value: JSON.stringify(cycles),
    });
  }

  // Language
  async getLanguage(): Promise<string> {
    const { value } = await Preferences.get({ key: StorageKey.Language });
    if (!value) {
      throw new Error(`Can't find '${StorageKey.Language}' in storage`);
    }
    return value;
  }

  async setLanguage(value: string): Promise<void> {
    await Preferences.set({ key: StorageKey.Language, value });
  }

  // Theme
  async getTheme(): Promise<string> {
    const { value } = await Preferences.get({ key: StorageKey.Theme });
    if (!value) {
      throw new Error(`Can't find '${StorageKey.Theme}' in storage`);
    }
    return value;
  }

  async setTheme(value: string): Promise<void> {
    await Preferences.set({ key: StorageKey.Theme, value });
  }

  // IsNotificationEnabled
  async getIsNotificationEnabled(): Promise<boolean> {
    const { value } = await Preferences.get({
      key: StorageKey.IsNotificationEnabled,
    });
    if (!value) {
      throw new Error(
        `Can't find '${StorageKey.IsNotificationEnabled}' in storage`,
      );
    }
    return value === "true";
  }

  async setIsNotificationEnabled(value: boolean): Promise<void> {
    await Preferences.set({
      key: StorageKey.IsNotificationEnabled,
      value: value.toString(),
    });
  }

  // LastNotificationId
  async getLastNotificationId(): Promise<number> {
    const { value } = await Preferences.get({
      key: StorageKey.LastNotificationId,
    });
    if (!value) {
      throw new Error(
        `Can't find '${StorageKey.LastNotificationId}' in storage`,
      );
    }
    return Number(value);
  }

  async setLastNotificationId(value: number): Promise<void> {
    await Preferences.set({
      key: StorageKey.LastNotificationId,
      value: value.toString(),
    });
  }

  // MaxNumberOfDisplayedCycles
  async getMaxNumberOfDisplayedCycles(): Promise<number> {
    const { value } = await Preferences.get({
      key: StorageKey.MaxNumberOfDisplayedCycles,
    });
    if (!value) {
      throw new Error(
        `Can't find '${StorageKey.MaxNumberOfDisplayedCycles}' in storage`,
      );
    }
    return Number(value);
  }

  async setMaxNumberOfDisplayedCycles(value: number): Promise<void> {
    await Preferences.set({
      key: StorageKey.MaxNumberOfDisplayedCycles,
      value: value.toString(),
    });
  }
}
