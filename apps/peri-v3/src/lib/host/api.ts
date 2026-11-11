import type { ManifestBase } from "@repo/config-schema/config-v2.schema";
import { service as core } from "@/services/core/service";
import type { Service as CoreService } from "@/services/core/service";
import { service as cycles } from "@/services/cycles/service";
import type { Service as CyclesService } from "@/services/cycles/service";
import { service as store } from "@/services/store/service";
import type { Service as StoreService } from "@/services/store/service";

interface Deps {
  store: Pick<StoreService, "get">;
  core: Pick<CoreService, "getActiveAlgorithm" | "setActiveAlgorithm">;
  cycles: Pick<CyclesService, "update">;
}

/**
 * The trusted API for the app's own UI. It has no permission checks, so it
 * must never be handed to community code
 */
export const createHostApi = (deps: Deps) => {
  const listAlgorithms = (): ManifestBase[] => {
    return deps.store.get().algorithms.map((algorithm) => {
      return algorithm.manifest;
    });
  };

  const listApps = (): ManifestBase[] => {
    return deps.store.get().apps.map((app) => {
      return app.manifest;
    });
  };

  return {
    listAlgorithms,
    listApps,
    getActiveAlgorithm: deps.core.getActiveAlgorithm.bind(deps.core),
    setActiveAlgorithm: deps.core.setActiveAlgorithm.bind(deps.core),
    updateCycles: deps.cycles.update.bind(deps.cycles),
  };
};

const host = createHostApi({ store, core, cycles });

/** Manifests of the registered algorithms */
export const listAlgorithms = host.listAlgorithms;

/** Manifests of the registered apps (widgets) */
export const listApps = host.listApps;

/** Id of the algorithm chosen for a prediction type, undefined if none */
export const getActiveAlgorithm = host.getActiveAlgorithm;

/** Chooses the algorithm for a prediction type and recomputes predictions */
export const setActiveAlgorithm = host.setActiveAlgorithm;

/**
 * Edits the cycles: gets the current list and returns the new one. The
 * service validates it and derives `end_date` and `cycle_length`
 */
export const updateCycles = host.updateCycles;
