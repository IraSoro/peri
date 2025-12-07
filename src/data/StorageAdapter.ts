import type { StorageBackend } from "./types";
import { StorageMode } from "./types";
import { LocalStorageBackend } from "./LocalStorageBackend";
import { RemoteStorageBackend } from "./RemoteStorageBackend";

class StorageAdapter {
  private backend: StorageBackend;
  private mode: StorageMode;

  constructor() {
    const modeConfig = import.meta.env.VITE_STORAGE_MODE as StorageMode;
    this.mode = modeConfig || StorageMode.Local;
    this.backend = this.mode === StorageMode.Remote
      ? new RemoteStorageBackend()
      : new LocalStorageBackend();

    console.log(`Storage initialized in ${this.mode} mode`);
  }

  getBackend(): StorageBackend {
    return this.backend;
  }

  getMode(): StorageMode {
    return this.mode;
  }
}

export const storageAdapter = new StorageAdapter();
