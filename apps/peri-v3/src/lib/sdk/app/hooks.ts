import { useContext } from "react";
import type { ConfigV2, Cycle } from "@repo/config-schema/config-v2.schema";
import { useStoreSelector } from "@/lib/hooks/useStoreSelector";
import type { KnownPermission } from "../permissions";
import { service as cycles } from "@/services/cycles/service";
import { InternalOnlyError, OutsideAppError, PermissionError } from "./errors";
import { AppContext } from "./Wrap";
import type { AppContextValue } from "./Wrap";

function useAccess(permission?: KnownPermission): AppContextValue {
  const access = useContext(AppContext);
  if (access === null) {
    throw new OutsideAppError();
  }
  if (
    permission &&
    access.source === "community" &&
    !access.permissions.includes(permission)
  ) {
    throw new PermissionError(permission);
  }
  return access;
}

const writeCycles: typeof cycles.update = (change) => {
  return cycles.update(change);
};

const denyCycles: typeof cycles.update = () => {
  throw new InternalOnlyError("edit cycles");
};

export function useCycles(): [Cycle[], typeof cycles.update] {
  const access = useAccess("cycles:read");
  const value = useStoreSelector((config) => {
    return config.cycles;
  });
  return [value, access.source === "internal" ? writeCycles : denyCycles];
}

export function usePredictions(): ConfigV2["predictions"] {
  useAccess("predictions:read");
  return useStoreSelector((config) => {
    return config.predictions;
  });
}
