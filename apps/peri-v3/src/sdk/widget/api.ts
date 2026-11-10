import { Temporal } from "temporal-polyfill";
import { formatInstant } from "@/lib/utils/dates";
import { service as core } from "@/services/core/service";
import { wrapWidget } from "./wrap";
import type { Service as CoreService } from "@/services/core/service";
import type { CoreOperationResult } from "@/services/core/types";
import type { CommunityManifest, InternalManifest } from "../types";
import type { CommunityWidget, InternalWidget } from "./types";

export function createWidgetApi(core: Pick<CoreService, "registerApp">) {
  /** Registers code that ships with the app */
  function defineInternalWidget(
    manifest: InternalManifest,
    widget: InternalWidget,
  ): Promise<CoreOperationResult> {
    return core.registerApp(
      { ...manifest, source: "internal", permissions: [] },
      wrapWidget(manifest.id, widget, { source: "internal", permissions: [] }),
    );
  }

  /** Registers community code, the host sets its source and install date */
  function defineWidget(
    manifest: CommunityManifest,
    widget: CommunityWidget,
  ): Promise<CoreOperationResult> {
    return core.registerApp(
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
  }

  return { defineInternalWidget, defineWidget };
}

export const { defineInternalWidget, defineWidget } = createWidgetApi(core);
