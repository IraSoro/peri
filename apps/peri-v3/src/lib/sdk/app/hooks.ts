import { useContext, useEffect, useState } from "react";
import type {
  ConfigV2,
  Cycle,
  PredictionDay,
} from "@repo/config-schema/config-v2.schema";
import { useStoreSelector } from "@/lib/hooks/useStoreSelector";
import type { KnownPermission } from "../permissions";
import { service as algorithms } from "@/services/algorithms/service";
import type { CoreData, PredictionType } from "@/services/core/types";
import { service as cycles } from "@/services/cycles/service";
import { useAlertsContext } from "@/components/layouts/Alerts";
import type { AlertInput } from "@/components/layouts/Alerts";
import { historyAt } from "../calculations/cycles";
import { InternalOnlyError, OutsideAppError, PermissionError } from "./errors";
import { AppContext } from "./context";
import type { AppContextValue } from "./context";

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

/**
 * The days the active algorithm of the type predicts for a logged cycle, as
 * it would have predicted them when the cycle began. The stored predictions
 * cover only the current cycle and the next ones, so this asks the algorithm
 * again. Undefined until the answer is ready, no days when the algorithm
 * fails or none is chosen
 */
export function usePastPrediction(
  type: PredictionType,
  cycle: Cycle,
): PredictionDay[] | undefined {
  useAccess("cycles:read");
  useAccess("predictions:read");
  const history = JSON.stringify(
    historyAt(
      useStoreSelector((config) => {
        return config.cycles;
      }),
      cycle,
    ),
  );
  const activeId = useStoreSelector((config) => {
    const data: CoreData = config.core.data;
    return data.active_algorithms?.[type];
  });
  // Its prediction appears once an algorithm chosen before its code was
  // registered gets to run
  const predictedBy = useStoreSelector((config) => {
    return config.predictions[type]?.algorithm_id;
  });
  const [days, setDays] = useState<PredictionDay[]>();
  useEffect(() => {
    if (activeId === undefined || !algorithms.isRegistered(activeId)) {
      setDays([]);
      return;
    }
    let stale = false;
    void algorithms
      .dryRun(activeId, JSON.parse(history) as Cycle[])
      .then((res) => {
        if (!stale) {
          setDays(res.ok ? res.days : []);
        }
      });
    return () => {
      stale = true;
    };
  }, [activeId, predictedBy, history]);
  return days;
}

/**
 * Shows an alert at the bottom of the app, `show` returns an id for `dismiss`.
 * An alert without actions closes by itself after a few seconds. Only
 * internal apps can show alerts
 */
export function useAlert(): {
  show: (alert: AlertInput) => number;
  dismiss: (id: number) => void;
} {
  const access = useAccess();
  const { showAlert, dismissAlert } = useAlertsContext();
  if (access.source !== "internal") {
    return {
      show: () => {
        throw new InternalOnlyError("show alerts");
      },
      dismiss: dismissAlert,
    };
  }
  return { show: showAlert, dismiss: dismissAlert };
}
