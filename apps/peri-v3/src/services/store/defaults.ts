import type { ConfigV2 } from "@repo/config-schema/config-v2.schema";

export function createDefaultConfig(): ConfigV2 {
  return {
    version: 2,
    revision: 0,
    core: {
      id: import.meta.env.VITE_APP_NAME,
      version: import.meta.env.VITE_APP_VERSION,
      data: {},
    },
    cycles: [],
    predictions: {},
    algorithms: [],
    apps: [],
  };
}
