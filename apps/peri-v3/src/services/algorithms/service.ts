import type {
  ConfigV2,
  ManifestBase,
} from "@repo/config-schema/config-v2.schema";
import { service as store } from "@/services/store/service";
import type { Service as StoreService } from "@/services/store/service";
import type {
  AlgorithmEntry,
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
    manifest: ManifestBase,
    entry: AlgorithmEntry,
  ): Promise<AlgorithmOperationResult> {
    if (this.#entries.has(manifest.id)) {
      return {
        ok: false,
        error: {
          code: "already_registered",
          message: `algorithm "${manifest.id}" is already registered`,
        },
      };
    }

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
      return { ...config, algorithms };
    });
    if (!res.ok) {
      return {
        ok: false,
        error: { code: "invalid_manifest", message: res.error.message },
      };
    }

    this.#entries.set(manifest.id, entry);
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

  async run(id: string): Promise<AlgorithmOperationResult> {
    const entry = this.#entries.get(id);
    if (!entry) {
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
      output = await entry.run({ cycles: this.#store.get().cycles });
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

    const made = output;
    const res = await this.#store.update((config) => {
      const predictions = this.#omitPredictionsOf(config.predictions, id);
      for (const [type, days] of Object.entries(made)) {
        if (days === undefined) {
          continue;
        }
        predictions[type] = { algorithm_id: id, days };
      }
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

  #isAlgorithmOutput(value: unknown): value is AlgorithmOutput {
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
      return false;
    }
    return Object.values(value).every((days) => {
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

console.info(`[algorithms] ready in ${performance.now() - start}ms`);
