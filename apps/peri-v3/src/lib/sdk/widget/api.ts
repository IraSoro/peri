import { Temporal } from "temporal-polyfill";
import { formatInstant } from "@/lib/utils/dates";
import { service as core } from "@/services/core/service";
import { wrapWidget } from "./wrap";
import type { Service as CoreService } from "@/services/core/service";
import type { CoreOperationResult } from "@/services/core/types";
import type { CommunityManifest, InternalManifest } from "../types";
import type { CommunityWidget, InternalWidget } from "./types";

interface Options {
  /** Lets an internal widget register again and replace its entry, for hot reload */
  replaceInternal?: boolean;
}

export function createWidgetApi(
  core: Pick<CoreService, "registerApp">,
  options: Options = {},
) {
  async function defineInternalWidget(
    manifest: InternalManifest,
    widget: InternalWidget,
  ): Promise<CoreOperationResult> {
    const start = performance.now();
    const res = await core.registerApp(
      { ...manifest, source: "internal", permissions: [] },
      wrapWidget(manifest.id, widget, { source: "internal", permissions: [] }),
      { replace: options.replaceInternal },
    );
    if (res.ok) {
      console.info(
        `[widget] ${manifest.id} registered in ${(performance.now() - start).toFixed(1)}ms`,
      );
    } else {
      console.warn(
        `[widget] ${manifest.id} not registered (${(performance.now() - start).toFixed(1)}ms): ${res.error.message}`,
      );
    }

    return res;
  }

  async function defineWidget(
    manifest: CommunityManifest,
    widget: CommunityWidget,
  ): Promise<CoreOperationResult> {
    const start = performance.now();
    const res = await core.registerApp(
      {
        ...manifest,
        source: "community",
        installed_at: formatInstant(Temporal.Now.instant()),
      },
      wrapWidget(manifest.id, widget, {
        source: "community",
        permissions: manifest.permissions,
      }),
    );
    if (res.ok) {
      console.info(
        `[community widget] ${manifest.id} registered in ${(performance.now() - start).toFixed(1)}ms`,
      );
    } else {
      console.warn(
        `[community widget] ${manifest.id} not registered (${(performance.now() - start).toFixed(1)}ms): ${res.error.message}`,
      );
    }

    return res;
  }

  return { defineInternalWidget, defineWidget };
}

const api = createWidgetApi(core, { replaceInternal: import.meta.env.DEV });

/** Registers code that ships with the app */
export const defineInternalWidget = api.defineInternalWidget;

/** Registers community code */
export const defineWidget = api.defineWidget;
