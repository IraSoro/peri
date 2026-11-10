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
  /** Registers code that ships with the app, it gets the whole input */
  function defineInternalAlgorithm(
    manifest: InternalManifest,
    algorithm: InternalAlgorithm,
  ): Promise<CoreOperationResult> {
    return core.registerAlgorithm(
      { ...manifest, source: "internal", permissions: [] },
      algorithm,
    );
  }

  /** Registers community code, it sees only the input its permissions allow */
  function defineAlgorithm(
    manifest: CommunityManifest,
    algorithm: CommunityAlgorithm,
  ): Promise<CoreOperationResult> {
    return core.registerAlgorithm(
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
  }

  return { defineInternalAlgorithm, defineAlgorithm };
}

export const { defineInternalAlgorithm, defineAlgorithm } =
  createAlgorithmApi(core);
