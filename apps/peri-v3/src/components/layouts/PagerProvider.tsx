import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useGesture } from "@use-gesture/react";
import useEmblaCarousel from "embla-carousel-react";

type PagerContextProps = {
  emblaRef: ReturnType<typeof useEmblaCarousel>[0];
  activePageId: string;
  canGoNext: boolean;
  canGoPrev: boolean;
  setBlockNext: (blocked: boolean) => void;
  setBlockPrev: (blocked: boolean) => void;
};

const PagerContext = createContext<PagerContextProps | null>(null);

export function usePager() {
  const context = useContext(PagerContext);

  if (!context) {
    throw new Error("usePager must be used within a <PagerProvider />");
  }

  return context;
}

type PagerProviderProps = {
  pageIds: string[];
  children: React.ReactNode;
  startPageId?: string;
};

export const PagerProvider = ({
  pageIds,
  children,
  startPageId,
}: PagerProviderProps) => {
  const startIndex = startPageId
    ? Math.max(pageIds.indexOf(startPageId), 0)
    : 0;

  const [emblaRef, emblaApi] = useEmblaCarousel({
    axis: "y",
    loop: false,
    startIndex,
    watchDrag: (_emblaApi, evt) => !evt.isTrusted,
  });

  const pageIndexRef = useRef(startIndex);
  // NOTE: Mirrors pageIndexRef in React state purely so consumers re-render on
  // page change - the gesture/bridge logic below keeps reading the ref.
  const [pageIndex, setPageIndex] = useState(startIndex);

  const bridgingRef = useRef(false);

  const blockNextRef = useRef(false);
  const blockPrevRef = useRef(false);
  // NOTE: Mirror the block refs in React state purely so consumers
  // re-render when a block engages/releases.
  const [blockNext, setBlockNextState] = useState(false);
  const [blockPrev, setBlockPrevState] = useState(false);

  const setBlockNext = useCallback((blocked: boolean) => {
    blockNextRef.current = blocked;
    setBlockNextState(blocked);
  }, []);

  const setBlockPrev = useCallback((blocked: boolean) => {
    blockPrevRef.current = blocked;
    setBlockPrevState(blocked);
  }, []);

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      pageIndexRef.current = emblaApi.selectedScrollSnap();
      setPageIndex(pageIndexRef.current);
      // NOTE: A newly active page starts unblocked - it opts in to blocking
      // via setBlockNext/setBlockPrev if it needs to.
      setBlockNext(false);
      setBlockPrev(false);
    };

    onSelect();
    emblaApi.on("select", onSelect);

    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, setBlockNext, setBlockPrev]);

  const getEdgeState = () => {
    const el = emblaApi?.slideNodes()[pageIndexRef.current];
    if (!el) return { atTop: true, atBottom: true };
    const { scrollTop, scrollHeight, clientHeight } = el;
    return {
      atTop: scrollTop <= 0,
      atBottom: scrollTop + clientHeight >= scrollHeight - 1,
    };
  };

  const dispatchBridgeEvent = (type: string, clientY: number) => {
    const container = emblaApi?.containerNode();
    if (!container) return;
    container.dispatchEvent(
      new MouseEvent(type, {
        clientY,
        bubbles: true,
        cancelable: true,
        composed: true,
      }),
    );
  };

  const startBridge = (clientY: number) => {
    bridgingRef.current = true;
    dispatchBridgeEvent("mousedown", clientY);
  };

  const moveBridge = (clientY: number) => {
    dispatchBridgeEvent("mousemove", clientY);
  };

  const endBridge = () => {
    if (!bridgingRef.current) return;
    bridgingRef.current = false;
    dispatchBridgeEvent("mouseup", 0);

    // Embla treats our synthetic mousedown/mousemove/mouseup exactly like a
    // real mouse drag: it arms an internal "preventClick" flag meant to
    // swallow the next click after a real drag-release, via a capturing
    // click listener on rootNode. Since our bridge never actually produces
    // a real click of its own, that flag would otherwise stay armed and
    // eat the user's next genuine tap/click anywhere in the app. Dispatch a
    // synthetic click on the same node to let Embla consume/clear it now.
    const root = emblaApi?.rootNode();
    root?.dispatchEvent(
      new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
        composed: true,
      }),
    );
  };

  // dy > 0 = intent to reveal content below (go to next page)
  const isEligible = (dy: number) => {
    const { atTop, atBottom } = getEdgeState();
    const atFirstPage = pageIndexRef.current === 0;
    const atLastPage = pageIndexRef.current === pageIds.length - 1;
    const canGoNext =
      dy > 0 && atBottom && !atLastPage && !blockNextRef.current;
    const canGoPrev = dy < 0 && atTop && !atFirstPage && !blockPrevRef.current;
    return canGoNext || canGoPrev;
  };

  useGesture(
    {
      // movement/xy are in screen space (y increases downward); moving up
      // means "reveal content below" -> treat as a positive delta.
      onDrag: ({
        first,
        last,
        movement: [, my],
        delta: [, ddy],
        xy: [, y],
      }) => {
        if (first) {
          if (isEligible(-my)) startBridge(y);
          return;
        }
        if (!bridgingRef.current) return;
        // Re-check on every tick, not just the first - a page's block state
        // can flip true mid-gesture as the drag crosses into it, and a long
        // enough continuous drag shouldn't be able to ride straight through.
        if (!isEligible(-ddy)) {
          endBridge();
          return;
        }
        moveBridge(y);
        if (last) endBridge();
      },
    },
    {
      target: emblaApi ? emblaApi.rootNode() : undefined,
      drag: { axis: "y", eventOptions: { passive: true } },
    },
  );

  return (
    <PagerContext
      value={{
        emblaRef,
        activePageId: pageIds[pageIndex],
        canGoNext: pageIndex < pageIds.length - 1 && !blockNext,
        canGoPrev: pageIndex > 0 && !blockPrev,
        setBlockNext,
        setBlockPrev,
      }}
    >
      {children}
    </PagerContext>
  );
};
