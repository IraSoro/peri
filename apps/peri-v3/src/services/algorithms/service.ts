import type {
  AlgorithmManifest,
  ConfigV2,
  Cycle,
  Prediction,
} from "@repo/config-schema/config-v2.schema";
import { service as store } from "@/services/store/service";
import type { Service as StoreService } from "@/services/store/service";
import type {
  AlgorithmDryRunResult,
  AlgorithmEntry,
  AlgorithmError,
  AlgorithmOperationResult,
  AlgorithmOutput,
} from "./types";

export class Service {
  #store: StoreService;
  #entries: Map<string, AlgorithmEntry>;

  constructor(store: StoreService) {
    this.#store = store;
    this.#entries = new Map();
  }

  async register(
    manifest: AlgorithmManifest,
    entry: AlgorithmEntry,
    options: { replace?: boolean } = {},
  ): Promise<AlgorithmOperationResult> {
    if (!options.replace && this.#entries.has(manifest.id)) {
      return {
        ok: false,
        error: {
          code: "already_registered",
          message: `algorithm "${manifest.id}" is already registered`,
        },
      };
    }

    // Set the entry first so a manifest in the store always has its entry
    const previous = this.#entries.get(manifest.id);
    this.#entries.set(manifest.id, entry);
    const res = await this.#store.update((config) => {
      const index = config.algorithms.findIndex((a) => {
        return a.manifest.id === manifest.id;
      });
      const installedAt = config.algorithms[index]?.manifest.installed_at;
      const next = {
        manifest: installedAt
          ? { ...manifest, installed_at: installedAt }
          : manifest,
      };
      const algorithms = [...config.algorithms];
      if (index === -1) {
        algorithms.push(next);
      } else {
        algorithms[index] = next;
      }
      // A changed prediction type leaves the predictions made for its old type.
      // They are dropped in the same update, otherwise the store would reject
      // it (the prediction key no longer matches the algorithm type). New
      // predictions appear on the next run
      const typeChanged =
        index !== -1 &&
        config.algorithms[index]?.manifest.type !== manifest.type;
      return {
        ...config,
        algorithms,
        predictions: typeChanged
          ? this.#omitPredictionsOf(config.predictions, manifest.id)
          : config.predictions,
      };
    });
    if (!res.ok) {
      if (previous) {
        this.#entries.set(manifest.id, previous);
      } else {
        this.#entries.delete(manifest.id);
      }
      return {
        ok: false,
        error: { code: "invalid_manifest", message: res.error.message },
      };
    }

    return { ok: true };
  }

  async unregister(id: string): Promise<AlgorithmOperationResult> {
    const known =
      this.#entries.has(id) ||
      this.#store.get().algorithms.some((a) => {
        return a.manifest.id === id;
      });
    if (!known) {
      return {
        ok: false,
        error: {
          code: "unknown_algorithm",
          message: `algorithm "${id}" is not registered`,
        },
      };
    }

    const res = await this.#store.update((config) => {
      return {
        ...config,
        algorithms: config.algorithms.filter((a) => {
          return a.manifest.id !== id;
        }),
        predictions: this.#omitPredictionsOf(config.predictions, id),
      };
    });
    if (!res.ok) {
      return {
        ok: false,
        error: { code: "invalid_manifest", message: res.error.message },
      };
    }

    this.#entries.delete(id);
    return { ok: true };
  }

  isRegistered(id: string): boolean {
    return this.#entries.has(id);
  }

  async run(id: string): Promise<AlgorithmOperationResult> {
    const made = await this.#execute(id, this.#store.get().cycles);
    if (!made.ok) {
      return made;
    }

    const { type, days } = made;
    const res = await this.#store.update((config) => {
      const predictions = this.#omitPredictionsOf(config.predictions, id);
      predictions[type] = { algorithm_id: id, days };
      return { ...config, predictions };
    });
    if (!res.ok) {
      return {
        ok: false,
        error: { code: "invalid_output", message: res.error.message },
      };
    }

    return { ok: true };
  }

  async dryRun(
    id: string,
    cycles: readonly Cycle[],
  ): Promise<AlgorithmDryRunResult> {
    const made = await this.#execute(id, cycles);
    return made.ok ? { ok: true, days: made.days } : made;
  }

  async #execute(
    id: string,
    cycles: readonly Cycle[],
  ): Promise<
    | { ok: true; type: AlgorithmManifest["type"]; days: Prediction["days"] }
    | { ok: false; error: AlgorithmError }
  > {
    const entry = this.#entries.get(id);
    const manifest = this.#store.get().algorithms.find((a) => {
      return a.manifest.id === id;
    })?.manifest;
    if (!entry || !manifest) {
      return {
        ok: false,
        error: {
          code: "unknown_algorithm",
          message: `algorithm "${id}" is not registered`,
        },
      };
    }

    let output: unknown;
    try {
      output = await entry.run({ cycles });
    } catch (err) {
      return {
        ok: false,
        error: {
          code: "run_failed",
          message: `${id}: ${(err as Error).message}`,
        },
      };
    }
    if (!this.#isAlgorithmOutput(output)) {
      return {
        ok: false,
        error: {
          code: "invalid_output",
          message: `${id}: unexpected output format`,
        },
      };
    }

    return { ok: true, type: manifest.type, days: output.days };
  }

  #isAlgorithmOutput(value: unknown): value is AlgorithmOutput {
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
      return false;
    }
    const { days } = value as { days?: unknown };
    if (!Array.isArray(days)) {
      return false;
    }
    return days.every((day) => {
      return (
        typeof day === "object" &&
        day !== null &&
        typeof (day as { date?: unknown }).date === "string"
      );
    });
  }

  #omitPredictionsOf(
    predictions: ConfigV2["predictions"],
    algorithmId: string,
  ): ConfigV2["predictions"] {
    return Object.fromEntries(
      Object.entries(predictions).filter(([, prediction]) => {
        return prediction.algorithm_id !== algorithmId;
      }),
    );
  }
}

const start = performance.now();
console.info("[algorithms] starting");

export const service = new Service(store);

console.info(
  `[algorithms] ready in ${(performance.now() - start).toFixed(1)}ms`,
);
