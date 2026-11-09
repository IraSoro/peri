import type { ConfigV2 } from "@repo/config-schema/config-v2.schema";
import type {
  MigrateOperation,
  StoreBackend,
  StoreListener,
  StoreOperationResult,
} from "./types";
import { createDefaultConfig } from "./defaults";
import { initDefault, v1ToV2 } from "./migrate";
import { validateConfigV2 } from "@repo/config-schema/validate-config-v2";
import { Stub } from "./backends/stub";

export class Service {
  #backend: StoreBackend;
  #config: ConfigV2;
  #queue: Promise<StoreOperationResult | undefined>;
  #listeners: Set<StoreListener>;
  #migrations: MigrateOperation[];

  constructor(backend: StoreBackend) {
    this.#backend = backend;
    this.#config = createDefaultConfig();
    this.#queue = Promise.resolve(undefined);
    this.#listeners = new Set();
    this.#migrations = [initDefault, v1ToV2];
  }

  get(): ConfigV2 {
    return structuredClone(this.#config);
  }

  async load(): Promise<StoreOperationResult> {
    let data = await this.#backend.read();
    for (const m of this.#migrations) {
      const res = m(data);
      if (!res.ok) {
        return {
          ok: false,
          error: {
            code: "invalid_migration",
            message: `${res.error.code}: ${res.error.message}`,
          },
        };
      }
      data = res.data;
    }

    const validated = validateConfigV2(data);
    if (!validated.ok) {
      return {
        ok: false,
        error: {
          code: "invalid_config",
          message: validated.errors
            .map((err) => `${err.path}: ${err.message}`)
            .join("; "),
        },
      };
    }

    await this.#backend.write(validated.config);
    this.#config = validated.config;

    for (const l of this.#listeners) {
      try {
        l();
      } catch (err) {
        console.error(`store listener failed: ${(err as Error).message}`);
      }
    }

    return { ok: true };
  }

  subscribe(l: StoreListener) {
    this.#listeners.add(l);
    return () => {
      this.#listeners.delete(l);
    };
  }

  update(change: (config: ConfigV2) => ConfigV2) {
    const run = this.#queue.then(() =>
      this.#commit({
        ...change(structuredClone(this.#config)),
        revision: this.#config.revision + 1,
      }),
    );
    this.#queue = run.catch(() => undefined);
    return run;
  }

  async #commit(next: unknown): Promise<StoreOperationResult> {
    const validated = validateConfigV2(next);
    if (!validated.ok) {
      return {
        ok: false,
        error: {
          code: "invalid_config",
          message: validated.errors
            .map((err) => `${err.path}: ${err.message}`)
            .join("; "),
        },
      };
    }

    await this.#backend.write(validated.config);
    this.#config = validated.config;

    for (const l of this.#listeners) {
      try {
        l();
      } catch (err) {
        console.error(`store listener failed: ${(err as Error).message}`);
      }
    }

    return { ok: true };
  }
}

const start = performance.now();
console.info("[store] starting");

export const service = new Service(new Stub());
await service.load();

console.info(`[store] ready in ${performance.now() - start}ms`);
