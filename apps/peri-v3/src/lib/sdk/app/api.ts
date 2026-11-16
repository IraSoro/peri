import { Temporal } from "temporal-polyfill";
import { formatInstant } from "@/lib/utils/dates";
import { service as core } from "@/services/core/service";
import { wrapApp } from "./Wrap";
import type { Service as CoreService } from "@/services/core/service";
import type { CoreOperationResult } from "@/services/core/types";
import type { CommunityAppManifest, InternalAppManifest } from "../types";
import type { CommunityApp, InternalApp } from "./types";

interface Options {
  /** Lets an internal app register again and replace its entry, for hot reload */
  replaceInternal?: boolean;
}

export function createAppApi(
  core: Pick<CoreService, "registerApp">,
  options: Options = {},
) {
  async function defineInternalApp(
    manifest: InternalAppManifest,
    app: InternalApp,
  ): Promise<CoreOperationResult> {
    const start = performance.now();
    const res = await core.registerApp(
      { ...manifest, source: "internal", permissions: [] },
      wrapApp(manifest.id, app, { source: "internal", permissions: [] }),
      { replace: options.replaceInternal },
    );
    if (res.ok) {
      console.info(
        `[app] ${manifest.id} registered in ${(performance.now() - start).toFixed(1)}ms`,
      );
    } else {
      console.warn(
        `[app] ${manifest.id} not registered (${(performance.now() - start).toFixed(1)}ms): ${res.error.message}`,
      );
    }

    return res;
  }

  async function defineApp(
    manifest: CommunityAppManifest,
    app: CommunityApp,
  ): Promise<CoreOperationResult> {
    const start = performance.now();
    const res = await core.registerApp(
      {
        ...manifest,
        source: "community",
        installed_at: formatInstant(Temporal.Now.instant()),
      },
      wrapApp(manifest.id, app, {
        source: "community",
        permissions: manifest.permissions,
      }),
    );
    if (res.ok) {
      console.info(
        `[community app] ${manifest.id} registered in ${(performance.now() - start).toFixed(1)}ms`,
      );
    } else {
      console.warn(
        `[community app] ${manifest.id} not registered (${(performance.now() - start).toFixed(1)}ms): ${res.error.message}`,
      );
    }

    return res;
  }

  return { defineInternalApp, defineApp };
}

const api = createAppApi(core, { replaceInternal: import.meta.env.DEV });

/** Registers code that ships with the app */
export const defineInternalApp = api.defineInternalApp;

/** Registers community code */
export const defineApp = api.defineApp;
