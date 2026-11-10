import { service as algorithms } from "@/services/algorithms/service";
import type { Service as AlgorithmsService } from "@/services/algorithms/service";
import { service as store } from "@/services/store/service";
import type { Service as StoreService } from "@/services/store/service";
import type { CoreData, CoreOperationResult, PredictionType } from "./types";

export class Service {
  #store: StoreService;
  #algorithms: AlgorithmsService;
  #queue: Promise<unknown>;
  #cyclesSnapshot: string;
  #unsubscribe: (() => void) | undefined;

  constructor(store: StoreService, algorithms: AlgorithmsService) {
    this.#store = store;
    this.#algorithms = algorithms;
    this.#queue = Promise.resolve();
    this.#cyclesSnapshot = "";
    this.#unsubscribe = undefined;
  }

  async start(): Promise<CoreOperationResult> {
    if (this.#unsubscribe) {
      return { ok: true };
    }
    this.#cyclesSnapshot = JSON.stringify(this.#store.get().cycles);
    this.#unsubscribe = this.#store.subscribe(() => {
      const next = JSON.stringify(this.#store.get().cycles);
      if (next === this.#cyclesSnapshot) {
        return;
      }
      this.#cyclesSnapshot = next;
      this.recompute().catch((err: unknown) => {
        console.error(`[core] recompute failed: ${(err as Error).message}`);
      });
    });
    return this.recompute();
  }

  stop() {
    this.#unsubscribe?.();
    this.#unsubscribe = undefined;
  }

  getActiveAlgorithm(type: PredictionType): string | undefined {
    const data: CoreData = this.#store.get().core.data;
    return data.active_algorithms?.[type];
  }

  async setActiveAlgorithm(
    type: PredictionType,
    algorithmId: string,
  ): Promise<CoreOperationResult> {
    const known = this.#store.get().algorithms.some((a) => {
      return a.manifest.id === algorithmId;
    });
    if (!known) {
      return {
        ok: false,
        error: {
          code: "unknown_algorithm",
          message: `algorithm "${algorithmId}" is not registered`,
        },
      };
    }

    const res = await this.#store.update((config) => {
      const data: CoreData = config.core.data;
      return {
        ...config,
        core: {
          ...config.core,
          data: {
            ...data,
            active_algorithms: {
              ...data.active_algorithms,
              [type]: algorithmId,
            },
          },
        },
      };
    });
    if (!res.ok) {
      return {
        ok: false,
        error: { code: "invalid_data", message: res.error.message },
      };
    }

    return this.recompute();
  }

  recompute(): Promise<CoreOperationResult> {
    const run = this.#queue.then(async (): Promise<CoreOperationResult> => {
      // An unregistered algorithm can't run, drop it so it doesn't fail
      // every recompute forever
      const registered = new Set(
        this.#store.get().algorithms.map((a) => {
          return a.manifest.id;
        }),
      );
      const current: CoreData = this.#store.get().core.data;
      const dangling = Object.values(current.active_algorithms ?? {}).some(
        (id) => {
          return !registered.has(id);
        },
      );
      if (dangling) {
        await this.#store.update((config) => {
          const data: CoreData = config.core.data;
          const active = Object.fromEntries(
            Object.entries(data.active_algorithms ?? {}).filter(([, id]) => {
              return registered.has(id);
            }),
          );
          return {
            ...config,
            core: {
              ...config.core,
              data: { ...data, active_algorithms: active },
            },
          };
        });
      }

      const data: CoreData = this.#store.get().core.data;
      const ids = new Set(Object.values(data.active_algorithms ?? {}));
      let failure: CoreOperationResult = { ok: true };
      for (const id of ids) {
        const res = await this.#algorithms.run(id);
        if (!res.ok && failure.ok) {
          failure = {
            ok: false,
            error: { code: "algorithm_failed", message: res.error.message },
          };
        }
      }
      return failure;
    });
    this.#queue = run.catch(() => {
      return undefined;
    });
    return run;
  }
}

const start = performance.now();
console.info("[core] starting");

export const service = new Service(store, algorithms);
const started = await service.start();
if (!started.ok) {
  console.error(`[core] first recompute failed: ${started.error.message}`);
}

// Hot reload creates a new service on every edit, the old one must stop
// listening or each cycles change would run the algorithms twice
import.meta.hot?.dispose(() => {
  service.stop();
});

console.info(`[core] ready in ${performance.now() - start}ms`);
