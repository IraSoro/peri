import { useContext } from "react";
import type { ConfigV2, Cycle } from "@repo/config-schema/config-v2.schema";
import { useStoreSelector } from "@/lib/hooks/useStoreSelector";
import type { KnownPermission } from "../permissions";
import { OutsideWidgetError, PermissionError } from "./errors";
import { WidgetContext } from "./wrap";

function useRequirePermission(permission: KnownPermission): void {
  const access = useContext(WidgetContext);
  if (access === null) {
    throw new OutsideWidgetError();
  }
  if (
    access.source === "community" &&
    !access.permissions.includes(permission)
  ) {
    throw new PermissionError(permission);
  }
}

export function useCycles(): Cycle[] {
  useRequirePermission("cycles:read");
  return useStoreSelector((config) => {
    return config.cycles;
  });
}

export function usePredictions(): ConfigV2["predictions"] {
  useRequirePermission("predictions:read");
  return useStoreSelector((config) => {
    return config.predictions;
  });
}
