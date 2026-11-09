import type { StoreBackend } from "../types";

export class Stub implements StoreBackend {
  #data: unknown;

  constructor() {
    this.#data = null;
  }

  read(): Promise<unknown> {
    return Promise.resolve(structuredClone(this.#data));
  }

  write(data: unknown): Promise<void> {
    this.#data = data;
    return Promise.resolve();
  }
}
