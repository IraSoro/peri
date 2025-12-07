import type { Cycle } from "./ICycle";

export interface StorageBackend {
  // Cycles
  getCycles(): Promise<Cycle[]>;
  setCycles(cycles: Cycle[]): Promise<void>;

  // Settings
  getLanguage(): Promise<string>;
  setLanguage(value: string): Promise<void>;
  getTheme(): Promise<string>;
  setTheme(value: string): Promise<void>;
  getIsNotificationEnabled(): Promise<boolean>;
  setIsNotificationEnabled(value: boolean): Promise<void>;
  getLastNotificationId(): Promise<number>;
  setLastNotificationId(value: number): Promise<void>;
  getMaxNumberOfDisplayedCycles(): Promise<number>;
  setMaxNumberOfDisplayedCycles(value: number): Promise<void>;
}

export enum StorageMode {
  Local = 'local',
  Remote = 'remote'
}
