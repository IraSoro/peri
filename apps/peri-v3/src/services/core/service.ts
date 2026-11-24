import { service as algorithms } from "@/services/algorithms/service";
import type { Service as AlgorithmsService } from "@/services/algorithms/service";
import type { AlgorithmEntry } from "@/services/algorithms/types";
import { service as apps } from "@/services/apps/service";
import type { Service as AppsService } from "@/services/apps/service";
import type { AppEntry } from "@/services/apps/types";
import { service as store } from "@/services/store/service";
import type { Service as StoreService } from "@/services/store/service";
import type {
  AlgorithmManifest,
  AppManifest,
} from "@repo/config-schema/config-v2.schema";
import type {
  CoreData,
  CoreOperationResult,
  PredictionType,
  ModifyData,
  ModifyOperation,
} from "./types";
import { trimToLoggedPeriod, dropOvulationInPeriod } from "./modify";

export class Service {
  #store: StoreService;
  #algorithms: AlgorithmsService;
  #apps: AppsService;
  #queue: Promise<unknown>;
  #cyclesSnapshot: string;
  #unsubscribe: (() => void) | undefined;
  #predictionModifiers: ModifyOperation[];

  constructor(
    store: StoreService,
    algorithms: AlgorithmsService,
    apps: AppsService,
  ) {
    this.#store = store;
    this.#algorithms = algorithms;
    this.#apps = apps;
    this.#queue = Promise.resolve();
    this.#cyclesSnapshot = "";
    this.#unsubscribe = undefined;
    this.#predictionModifiers = [trimToLoggedPeriod, dropOvulationInPeriod];
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
      this.#recompute().catch((err: unknown) => {
        console.error(`[core] recompute failed: ${(err as Error).message}`);
      });
    });
    return this.#recompute();
  }

  stop() {
    this.#unsubscribe?.();
    this.#unsubscribe = undefined;
  }

  async registerAlgorithm(
    manifest: AlgorithmManifest,
    entry: AlgorithmEntry,
    options: { replace?: boolean } = {},
  ): Promise<CoreOperationResult> {
    const res = await this.#algorithms.register(manifest, entry, options);
    if (!res.ok) {
      return {
        ok: false,
        error: { code: "registration_failed", message: res.error.message },
      };
    }
    // A changed prediction type leaves the algorithm chosen for its old type.
    // Only the stale entry is dropped, the algorithm isn't made active for
    // the new type
    const stale = await this.#store.update((config) => {
      const data: CoreData = config.core.data;
      const active = Object.fromEntries(
        Object.entries(data.active_algorithms ?? {}).filter(
          ([type, activeId]) => {
            return activeId !== manifest.id || type === manifest.type;
          },
        ),
      );
      return {
        ...config,
        core: { ...config.core, data: { ...data, active_algorithms: active } },
      };
    });
    if (!stale.ok) {
      return {
        ok: false,
        error: { code: "invalid_data", message: stale.error.message },
      };
    }
    const data: CoreData = this.#store.get().core.data;
    const active = Object.values(data.active_algorithms ?? {}).includes(
      manifest.id,
    );
    return active ? this.#recompute() : { ok: true };
  }

  async unregisterAlgorithm(id: string): Promise<CoreOperationResult> {
    const res = await this.#algorithms.unregister(id);
    if (!res.ok) {
      return {
        ok: false,
        error: { code: "registration_failed", message: res.error.message },
      };
    }
    const dropped = await this.#store.update((config) => {
      const data: CoreData = config.core.data;
      const active = Object.fromEntries(
        Object.entries(data.active_algorithms ?? {}).filter(([, activeId]) => {
          return activeId !== id;
        }),
      );
      return {
        ...config,
        core: { ...config.core, data: { ...data, active_algorithms: active } },
      };
    });
    if (!dropped.ok) {
      return {
        ok: false,
        error: { code: "invalid_data", message: dropped.error.message },
      };
    }
    return { ok: true };
  }

  async registerApp(
    manifest: AppManifest,
    entry: AppEntry,
    options: { replace?: boolean } = {},
  ): Promise<CoreOperationResult> {
    const res = await this.#apps.register(manifest, entry, options);
    if (!res.ok) {
      return {
        ok: false,
        error: { code: "registration_failed", message: res.error.message },
      };
    }
    return { ok: true };
  }

  async unregisterApp(id: string): Promise<CoreOperationResult> {
    const res = await this.#apps.unregister(id);
    if (!res.ok) {
      return {
        ok: false,
        error: { code: "registration_failed", message: res.error.message },
      };
    }
    return { ok: true };
  }

  getActiveAlgorithm(type: PredictionType): string | undefined {
    const data: CoreData = this.#store.get().core.data;
    return data.active_algorithms?.[type];
  }

  async setActiveAlgorithm(
    type: PredictionType,
    algorithmId: string,
  ): Promise<CoreOperationResult> {
    const algorithm = this.#store.get().algorithms.find((a) => {
      return a.manifest.id === algorithmId;
    });
    if (!algorithm) {
      return {
        ok: false,
        error: {
          code: "unknown_algorithm",
          message: `algorithm "${algorithmId}" is not registered`,
        },
      };
    }
    if (algorithm.manifest.type !== type) {
      return {
        ok: false,
        error: {
          code: "type_mismatch",
          message: `algorithm "${algorithmId}" predicts "${algorithm.manifest.type}", not "${type}"`,
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

    return this.#recompute();
  }

  #recompute(): Promise<CoreOperationResult> {
    const run = this.#queue.then(async (): Promise<CoreOperationResult> => {
      const snapshot = this.#store.get();
      const data: CoreData = snapshot.core.data;
      const ids = new Set(Object.values(data.active_algorithms ?? {}));
      let result: CoreOperationResult = { ok: true };
      // The new predictions are kept here and checked before anything is
      // saved. An algorithm that failed keeps its old predictions
      let predictions = snapshot.predictions;
      for (const id of ids) {
        // The default config stores the manifest before the code registers.
        // Registering recomputes predictions
        if (!this.#algorithms.isRegistered(id)) {
          continue;
        }
        const type = snapshot.algorithms.find((a) => {
          return a.manifest.id === id;
        })?.manifest.type;
        const made = await this.#algorithms.dryRun(id, snapshot.cycles);
        if (!made.ok || type === undefined) {
          if (result.ok) {
            result = {
              ok: false,
              error: {
                code: "algorithm_failed",
                message: made.ok
                  ? `algorithm "${id}" is not registered`
                  : made.error.message,
              },
            };
          }
          continue;
        }
        predictions = {
          ...Object.fromEntries(
            Object.entries(predictions).filter(([, prediction]) => {
              return prediction.algorithm_id !== id;
            }),
          ),
          [type]: { algorithm_id: id, days: made.days },
        };
      }

      // The predictions of different algorithms must agree with each other
      // and with the logged cycles
      let adjusted: ModifyData = { cycles: snapshot.cycles, predictions };
      for (const modify of this.#predictionModifiers) {
        adjusted = modify(adjusted);
      }

      const res = await this.#store.update((config) => {
        return { ...config, predictions: adjusted.predictions };
      });
      if (!res.ok && result.ok) {
        result = {
          ok: false,
          error: { code: "invalid_data", message: res.error.message },
        };
      }
      return result;
    });
    this.#queue = run.catch(() => {
      return undefined;
    });
    return run;
  }
}

const start = performance.now();
console.info("[core] starting");

export const service = new Service(store, algorithms, apps);
const started = await service.start();
if (!started.ok) {
  console.error(`[core] first recompute failed: ${started.error.message}`);
}

// Hot reload creates a new service on every edit, the old one must stop
// listening or each cycles change would run the algorithms twice
import.meta.hot?.dispose(() => {
  service.stop();
});

console.info(`[core] ready in ${(performance.now() - start).toFixed(1)}ms`);
