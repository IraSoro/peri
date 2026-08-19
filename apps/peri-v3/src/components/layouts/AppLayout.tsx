import {
  Children,
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useGesture } from "@use-gesture/react";

type PageScrollContextProps = {
  atTop: boolean;
  atBottom: boolean;
};

const PageScrollContext = createContext<PageScrollContextProps | null>(null);

export function usePageScroll() {
  const context = useContext(PageScrollContext);

  if (!context) {
    throw new Error("usePageScroll must be used within an <AppLayout />");
  }

  return context;
}

type AppLayout = Pick<React.ComponentProps<"div">, "children">;

const SNAP_DURATION_MS = 300;
// Fraction of a page's height that must be dragged to commit to the next/prev page.
const SNAP_THRESHOLD_RATIO = 0.2;

export const AppLayout = ({ children }: AppLayout) => {
  const slides = Children.toArray(children);
  const pageCount = slides.length;

  const trackRef = useRef<HTMLDivElement | null>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);

  const [pageIndex, setPageIndex] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const pageIndexRef = useRef(0);
  const isAnimatingRef = useRef(false);
  const animationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const pullRef = useRef(0);
  const touchStartYRef = useRef(0);
  const lastTouchYRef = useRef(0);

  const getEdgeState = () => {
    const el = slideRefs.current[pageIndexRef.current];
    if (!el) return { atTop: true, atBottom: true };
    const { scrollTop, scrollHeight, clientHeight } = el;
    return {
      atTop: scrollTop <= 0,
      atBottom: scrollTop + clientHeight >= scrollHeight - 1,
    };
  };

  const getPageHeight = () => trackRef.current?.clientHeight ?? 0;

  const commitOrSnapBack = () => {
    const pulled = pullRef.current;
    pullRef.current = 0;

    if (pulled === 0) return; // nothing dragged, no transform change to animate/await

    const pageHeight = getPageHeight();
    const rawPagesMoved =
      pageHeight > 0
        ? Math.sign(pulled) *
          Math.floor(Math.abs(pulled) / pageHeight + (1 - SNAP_THRESHOLD_RATIO))
        : 0;
    // Cap to one page per gesture — a fast wheel flick can rack up a huge
    // cumulative delta in a single burst (unlike a physically-bounded touch
    // drag), which would otherwise skip through several pages at once.
    const pagesMoved =
      Math.sign(rawPagesMoved) * Math.min(1, Math.abs(rawPagesMoved));

    if (pagesMoved !== 0) {
      const nextIndex = Math.max(
        0,
        Math.min(pageCount - 1, pageIndexRef.current + pagesMoved),
      );
      pageIndexRef.current = nextIndex;
      setPageIndex(nextIndex);
    }

    isAnimatingRef.current = true;
    setIsAnimating(true);
    setDragOffset(0);

    // Fallback in case transitionend doesn't fire (e.g. interrupted transition)
    if (animationTimeoutRef.current) clearTimeout(animationTimeoutRef.current);
    animationTimeoutRef.current = setTimeout(
      handleTrackTransitionEnd,
      SNAP_DURATION_MS + 50,
    );
  };

  const handleTrackTransitionEnd = () => {
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
      animationTimeoutRef.current = null;
    }
    isAnimatingRef.current = false;
    setIsAnimating(false);
  };

  // dy > 0 = intent to reveal content below (go to next page)
  const handleOverscroll = (dy: number) => {
    if (isAnimatingRef.current || dy === 0) return;

    // Only re-validate against the true page edge when starting a new pull
    // from neutral. Once engaged, follow the gesture freely in either
    // direction (including back past neutral) and only decide at release.
    if (pullRef.current === 0) {
      const { atTop, atBottom } = getEdgeState();
      const atFirstPage = pageIndexRef.current === 0;
      const atLastPage = pageIndexRef.current === pageCount - 1;
      const canGoNext = dy > 0 && atBottom && !atLastPage;
      const canGoPrev = dy < 0 && atTop && !atFirstPage;
      if (!canGoNext && !canGoPrev) return;
    }

    // Cap the drag itself to one page's worth in each direction (or less
    // near a boundary) — matches the one-page-per-gesture commit cap below,
    // so release never snaps across a distance farther than what was visible.
    const pageHeight = getPageHeight();
    const pagesAvailableForward = Math.min(
      1,
      pageCount - 1 - pageIndexRef.current,
    );
    const pagesAvailableBackward = Math.min(1, pageIndexRef.current);
    const minPull = -pagesAvailableBackward * pageHeight;
    const maxPull = pagesAvailableForward * pageHeight;

    pullRef.current = Math.max(
      minPull,
      Math.min(maxPull, pullRef.current + dy),
    );
    setDragOffset(-pullRef.current);
  };

  // Desktop: wheel via use-gesture
  useGesture(
    {
      onWheel: ({ delta: [, dy], last }) => {
        handleOverscroll(dy);
        if (last) commitOrSnapBack();
      },
    },
    { target: trackRef, eventOptions: { passive: true } },
  );

  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current)
        clearTimeout(animationTimeoutRef.current);
    };
  }, []);

  // Mobile: raw touch events, NOT use-gesture's onDrag
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    const onTouchStart = (e: TouchEvent) => {
      touchStartYRef.current = e.touches[0].clientY;
      lastTouchYRef.current = e.touches[0].clientY;
    };

    const onTouchMove = (e: TouchEvent) => {
      const currentY = e.touches[0].clientY;
      const dy = lastTouchYRef.current - currentY; // finger up = positive dy = "scroll down" intent
      lastTouchYRef.current = currentY;
      handleOverscroll(dy);
    };

    const onTouchEnd = () => commitOrSnapBack();

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: true });
    el.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  return (
    <div className="flex h-dvh w-screen justify-center">
      <div className="relative flex h-full w-full flex-col lg:max-w-150">
        <Header />
        <Content>
          <div
            ref={trackRef}
            onTransitionEnd={handleTrackTransitionEnd}
            className={`flex h-full w-full flex-col ${isAnimating ? "transition-transform duration-300 ease-out" : ""}`}
            style={{
              transform: `translateY(calc(${-pageIndex * 100}% + ${dragOffset}px))`,
            }}
          >
            {slides.map((slide, i) => (
              <div
                key={i}
                ref={(el) => {
                  slideRefs.current[i] = el;
                }}
                className="size-full shrink-0 scrollbar-none overflow-y-auto"
              >
                {slide}
              </div>
            ))}
          </div>
        </Content>
        <Footer />
      </div>
    </div>
  );
};

const Header = () => {
  return (
    <div className="absolute top-0 flex min-h-12 items-center justify-center md:min-h-14">
      {/* Left block */}
      <div className="flex h-full items-center justify-center gap-x-2 p-3">
        {/* <Menu className="stroke-base-primary h-5 md:h-6" /> */}
      </div>
      {/* Center block */}
      <div className="flex size-full items-center justify-center gap-x-2 p-3" />
      {/* Right block */}
      <div className="flex h-full items-center justify-center gap-x-2 p-3" />
    </div>
  );
};

type ContentProps = Pick<React.ComponentProps<"div">, "children">;

const Content = ({ children }: ContentProps) => {
  return (
    <div className="flex size-full flex-col items-center justify-start overflow-hidden">
      {children}
    </div>
  );
};

const Footer = () => {
  return (
    <div className="absolute bottom-0 flex min-h-12 w-full items-center justify-center md:min-h-13">
      {/* Left block */}
      <div className="flex h-full items-center justify-center gap-x-2 p-3" />
      {/* Center block */}
      <div className="flex size-full items-center justify-center gap-x-2 p-3">
        {/* <Loader message="Loading" /> */}
        {/* <div className="flex items-center justify-center">
          <ChevronsUp className="stroke-base-primary h-6 w-6" />
          <div className="text-base-primary text-base md:text-xl">
            Swipe to continue
          </div>
        </div> */}
      </div>
      {/* Right block */}
      <div className="flex h-full items-center justify-center gap-x-2 p-3" />
    </div>
  );
};
