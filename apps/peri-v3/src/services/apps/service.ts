import type { ManifestBase } from "@repo/config-schema/config-v2.schema";
import { service as store } from "@/services/store/service";
import type { Service as StoreService } from "@/services/store/service";
import type { AppData, AppEntry, AppOperationResult } from "./types";

class UnknownAppError extends Error {}

export class Service {
  #store: StoreService;
  #apps: Map<string, AppEntry>;

  constructor(store: StoreService) {
    this.#store = store;
    this.#apps = new Map();
  }

  async register(
    manifest: ManifestBase,
    entry: AppEntry,
    options: { replace?: boolean } = {},
  ): Promise<AppOperationResult> {
    if (!options.replace && this.#apps.has(manifest.id)) {
      return {
        ok: false,
        error: {
          code: "already_registered",
          message: `app "${manifest.id}" is already registered`,
        },
      };
    }

    // Set the entry first so a manifest in the store always has its entry
    const previous = this.#apps.get(manifest.id);
    this.#apps.set(manifest.id, entry);
    const res = await this.#store.update((config) => {
      const index = config.apps.findIndex((a) => {
        return a.manifest.id === manifest.id;
      });
      const stored = config.apps[index];
      const installedAt = stored?.manifest.installed_at;
      const next = {
        manifest: installedAt
          ? { ...manifest, installed_at: installedAt }
          : manifest,
        data: stored?.data ?? {},
      };
      const apps = [...config.apps];
      if (index === -1) {
        apps.push(next);
      } else {
        apps[index] = next;
      }
      return { ...config, apps };
    });
    if (!res.ok) {
      if (previous) {
        this.#apps.set(manifest.id, previous);
      } else {
        this.#apps.delete(manifest.id);
      }
      return {
        ok: false,
        error: { code: "invalid_manifest", message: res.error.message },
      };
    }

    return { ok: true };
  }

  get(id: string): AppData | undefined {
    const app = this.#store.get().apps.find((a) => {
      return a.manifest.id === id;
    });
    return app?.data;
  }

  async update(
    id: string,
    change: (data: AppData) => AppData,
  ): Promise<AppOperationResult> {
    let res;
    try {
      res = await this.#store.update((config) => {
        const index = config.apps.findIndex((a) => {
          return a.manifest.id === id;
        });
        const app = config.apps[index];
        if (!app) {
          throw new UnknownAppError();
        }
        const apps = [...config.apps];
        apps[index] = { ...app, data: change(app.data) };
        return { ...config, apps };
      });
    } catch (err) {
      if (err instanceof UnknownAppError) {
        return {
          ok: false,
          error: {
            code: "unknown_app",
            message: `app "${id}" is not registered`,
          },
        };
      }
      throw err;
    }
    if (!res.ok) {
      return {
        ok: false,
        error: { code: "invalid_data", message: res.error.message },
      };
    }

    return { ok: true };
  }

  async unregister(id: string): Promise<AppOperationResult> {
    const known =
      this.#apps.has(id) ||
      this.#store.get().apps.some((a) => {
        return a.manifest.id === id;
      });
    if (!known) {
      return {
        ok: false,
        error: {
          code: "unknown_app",
          message: `app "${id}" is not registered`,
        },
      };
    }

    const res = await this.#store.update((config) => {
      return {
        ...config,
        apps: config.apps.filter((a) => {
          return a.manifest.id !== id;
        }),
      };
    });
    if (!res.ok) {
      return {
        ok: false,
        error: { code: "invalid_manifest", message: res.error.message },
      };
    }

    this.#apps.delete(id);
    return { ok: true };
  }
}

const start = performance.now();
console.info("[apps] starting");

export const service = new Service(store);

console.info(`[apps] ready in ${(performance.now() - start).toFixed(1)}ms`);
