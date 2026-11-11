import { Temporal } from "temporal-polyfill";
import { formatInstant } from "@/lib/utils/dates";
import { service as core } from "@/services/core/service";
import type { AlgorithmInput } from "@/services/algorithms/types";
import type { Service as CoreService } from "@/services/core/service";
import type { CoreOperationResult } from "@/services/core/types";
import { grantByPermissions } from "../permissions";
import type { CommunityManifest, InternalManifest } from "../types";
import type { CommunityAlgorithm, InternalAlgorithm } from "./types";

export function createAlgorithmApi(
  core: Pick<CoreService, "registerAlgorithm">,
) {
  async function defineInternalAlgorithm(
    manifest: InternalManifest,
    algorithm: InternalAlgorithm,
  ): Promise<CoreOperationResult> {
    const start = performance.now();
    const res = await core.registerAlgorithm(
      { ...manifest, source: "internal", permissions: [] },
      algorithm,
    );
    if (res.ok) {
      console.info(
        `[algorithm] ${manifest.id} registered in ${(performance.now() - start).toFixed(1)}ms`,
      );
    } else {
      console.warn(
        `[algorithm] ${manifest.id} not registered (${(performance.now() - start).toFixed(1)}ms): ${res.error.message}`,
      );
    }

    return res;
  }

  async function defineAlgorithm(
    manifest: CommunityManifest,
    algorithm: CommunityAlgorithm,
  ): Promise<CoreOperationResult> {
    const start = performance.now();
    const res = await core.registerAlgorithm(
      {
        ...manifest,
        source: "community",
        installed_at: formatInstant(Temporal.Now.instant()),
      },
      {
        run(input) {
          return algorithm.run(
            grantByPermissions<AlgorithmInput>(manifest.permissions, {
              "cycles:read": { cycles: input.cycles },
            }),
          );
        },
      },
    );
    if (res.ok) {
      console.info(
        `[community algorithm] ${manifest.id} registered in ${(performance.now() - start).toFixed(1)}ms`,
      );
    } else {
      console.warn(
        `[community algorithm] ${manifest.id} not registered (${(performance.now() - start).toFixed(1)}ms): ${res.error.message}`,
      );
    }

    return res;
  }

  return { defineInternalAlgorithm, defineAlgorithm };
}

const api = createAlgorithmApi(core);

/** Registers code that ships with the app, it gets the whole input */
export const defineInternalAlgorithm = api.defineInternalAlgorithm;

/** Registers community code, it sees only the input its permissions allow */
export const defineAlgorithm = api.defineAlgorithm;
