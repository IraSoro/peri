import { useEffect, useId } from "react";
import type {
  ConfigV2,
  Cycle,
  ManifestBase,
} from "@repo/config-schema/config-v2.schema";
import { useStoreSelector } from "@/lib/hooks/useStoreSelector";
import type { CoreData, PredictionType } from "@/services/core/types";
import { useFooterContext } from "@/components/layouts/Footer";
import { useHeaderContext } from "@/components/layouts/Header";
import { usePagerContext } from "@/components/layouts/PagerProvider";
import { updateCycles } from "./api";

/** Like useState: the cycles and a setter */
export const useCycles = (): [Cycle[], typeof updateCycles] => {
  const cycles = useStoreSelector((config) => {
    return config.cycles;
  });
  return [cycles, updateCycles];
};

/** The stored predictions, by prediction type */
export const usePredictions = (): ConfigV2["predictions"] => {
  return useStoreSelector((config) => {
    return config.predictions;
  });
};

/** Manifests of the registered algorithms */
export const useAlgorithms = (): ManifestBase[] => {
  const algorithms = useStoreSelector((config) => {
    return config.algorithms;
  });
  return algorithms.map((algorithm) => {
    return algorithm.manifest;
  });
};

/** Manifests of the registered apps (widgets) */
export const useApps = (): ManifestBase[] => {
  const apps = useStoreSelector((config) => {
    return config.apps;
  });
  return apps.map((app) => {
    return app.manifest;
  });
};

/** Id of the algorithm chosen for a prediction type, undefined if none */
export const useActiveAlgorithm = (
  type: PredictionType,
): string | undefined => {
  return useStoreSelector((config) => {
    const data: CoreData = config.core.data;
    return data.active_algorithms?.[type];
  });
};

/** Shows the footer loader with `message` while `show` is true and the component is mounted */
export function useShowFooterLoader(show: boolean, message: string) {
  const { showLoader, hideLoader } = useFooterContext();
  const id = useId();

  useEffect(() => {
    if (!show) {
      hideLoader(id);
      return;
    }

    showLoader(id, message);
    return () => hideLoader(id);
  }, [show, message, id, showLoader, hideLoader]);
}

/** Hides the header menu button while `hidden` is true and the component is mounted */
export function useHideHeaderMenuButton(hidden: boolean) {
  const { setMenuButtonVisible, clearMenuButtonVisible } = useHeaderContext();
  const id = useId();

  useEffect(() => {
    if (!hidden) {
      clearMenuButtonVisible(id);
      return;
    }

    setMenuButtonVisible(id, false);
    return () => clearMenuButtonVisible(id);
  }, [hidden, id, setMenuButtonVisible, clearMenuButtonVisible]);
}

/** Id of the page the pager shows now */
export const useActivePageId = (): string => {
  return usePagerContext().activePageId;
};

/** Blocks paging to the next page while `blocked` is true and the component is mounted */
export function useBlockNextPage(blocked: boolean) {
  const { setBlockNext } = usePagerContext();

  useEffect(() => {
    setBlockNext(blocked);
    return () => setBlockNext(false);
  }, [blocked, setBlockNext]);
}

/** Blocks paging to the previous page while `blocked` is true and the component is mounted */
export function useBlockPrevPage(blocked: boolean) {
  const { setBlockPrev } = usePagerContext();

  useEffect(() => {
    setBlockPrev(blocked);
    return () => setBlockPrev(false);
  }, [blocked, setBlockPrev]);
}

/** True if the pager can go to the next page, false on the last page or while it is blocked */
export const useCanGoNextPage = (): boolean => {
  return usePagerContext().canGoNext;
};

/** True if the pager can go to the previous page, false on the first page or while it is blocked */
export const useCanGoPrevPage = (): boolean => {
  return usePagerContext().canGoPrev;
};
