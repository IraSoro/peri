import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useGesture, useScroll } from "@use-gesture/react";

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

const OVERSCROLL_THRESHOLD = 200;

export const AppLayout = ({ children }: AppLayout) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const atTopRef = useRef(true);
  const atBottomRef = useRef(false);
  const pullRef = useRef(0);
  const lockedRef = useRef(false);
  const touchStartYRef = useRef(0);
  const lastTouchYRef = useRef(0);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = el;
      atTopRef.current = scrollTop <= 0;
      atBottomRef.current = scrollTop + clientHeight >= scrollHeight - 1;
      console.log("atTop", atTopRef.current);
      console.log("atBottom", atBottomRef.current);
    };

    el.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  const goNext = useCallback(() => console.log("switch to next page"), []);
  const goPrev = useCallback(() => console.log("switch to previous page"), []);

  const reset = () => {
    pullRef.current = 0;
    lockedRef.current = false;
  };

  // dy > 0 = intent to reveal content below (scroll down)
  const handleOverscroll = (dy: number) => {
    if (lockedRef.current) return;

    if (dy > 0 && atBottomRef.current) {
      pullRef.current += dy;
      if (pullRef.current > OVERSCROLL_THRESHOLD) {
        lockedRef.current = true;
        goNext();
      }
    } else if (dy < 0 && atTopRef.current) {
      pullRef.current += -dy;
      if (pullRef.current > OVERSCROLL_THRESHOLD) {
        lockedRef.current = true;
        goPrev();
      }
    } else {
      pullRef.current = 0;
    }
  };

  // Desktop: wheel via use-gesture
  useGesture(
    {
      onWheel: ({ delta: [, dy], last }) => {
        handleOverscroll(dy);
        if (last) reset();
      },
    },
    { target: scrollRef, eventOptions: { passive: true } },
  );

  // Mobile: raw touch events, NOT use-gesture's onDrag
  useEffect(() => {
    const el = scrollRef.current;
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

    const onTouchEnd = () => reset();

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
    <div className="flex h-screen w-screen justify-center">
      <div className="relative flex h-full w-full flex-col lg:max-w-150">
        <Header />
        <Content ref={scrollRef}>{children}</Content>
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

type ContentProps = Pick<React.ComponentProps<"div">, "children" | "ref">;

const Content = ({ children, ref }: ContentProps) => {
  return (
    <div className="flex size-full flex-col items-center justify-start overflow-hidden">
      <div ref={ref} className="size-full scrollbar-none overflow-y-auto">
        {children}
      </div>
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
