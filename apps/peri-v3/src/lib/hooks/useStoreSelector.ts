import { useSyncExternalStore } from "react";
import type { ConfigV2 } from "@repo/config-schema/config-v2.schema";
import { service as store } from "@/services/store/service";

let snapshot = store.get();
store.subscribe(() => {
  snapshot = store.get();
});

const subscribe = (listener: () => void) => {
  return store.subscribe(listener);
};

const getSnapshot = () => {
  return snapshot;
};

/**
 * Returns a part of the config and re-renders when the store changes. The
 * selector must return a part of the given config, not a new object
 */
export const useStoreSelector = <T>(select: (config: ConfigV2) => T): T => {
  const config = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return select(config);
};
