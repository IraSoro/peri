import type { ConfigV2 } from "@repo/config-schema/config-v2.schema";
import { manifest as medianMenstruationManifest } from "@/algorithms/median-menstruation/manifest";
import { manifest as medianOvulationManifest } from "@/algorithms/median-ovulation/manifest";
import { manifest as calendarAppManifest } from "@/apps/Calendar/manifest";
import { manifest as cycleInfoAppManifest } from "@/apps/CycleInfo/manifest";
import { manifest as periodStatusAppManifest } from "@/apps/PeriodStatus/manifest";
import { manifest as phaseInfoAppManifest } from "@/apps/PhaseInfo/manifest";

const ALGORITHMS = [medianMenstruationManifest, medianOvulationManifest];

const APPS = [
  periodStatusAppManifest,
  calendarAppManifest,
  phaseInfoAppManifest,
  cycleInfoAppManifest,
];

export function createEmptyConfig(): ConfigV2 {
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

export function createDefaultConfig(): ConfigV2 {
  const config = createEmptyConfig();
  return {
    ...config,
    core: {
      ...config.core,
      data: {
        active_algorithms: Object.fromEntries(
          ALGORITHMS.map((manifest) => {
            return [manifest.type, manifest.id];
          }),
        ),
      },
    },
    algorithms: ALGORITHMS.map((manifest) => {
      return { manifest: { ...manifest, source: "internal", permissions: [] } };
    }),
    apps: APPS.map((manifest) => {
      return {
        manifest: { ...manifest, source: "internal", permissions: [] },
        data: {},
      };
    }),
  };
}
