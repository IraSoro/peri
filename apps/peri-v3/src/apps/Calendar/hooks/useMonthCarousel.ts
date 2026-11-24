import { useCallback, useEffect, useRef, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { addMonths, startOfMonth } from "date-fns";

// Initial window size: how many months are rendered before/after the
// current month on first mount.
const MONTHS_BEFORE = 6;
const MONTHS_AFTER = 6;
// How many months to append/prepend each time the window needs to grow.
const MONTHS_GROW = 6;
// How close (in slides) the active month can get to either end of the
// window before it triggers growth.
const EDGE_THRESHOLD = 2;
// How many months away the carousel jumps to the current one, not slides
const FAR_MONTHS = 2;

/**
 * Months in a swipeable carousel. The window of months grows as the user
 * comes close to either end of it
 */
export const useMonthCarousel = (direction: "ltr" | "rtl") => {
  const [months, setMonths] = useState(() => {
    const baseMonth = startOfMonth(new Date());
    return Array.from(
      { length: MONTHS_BEFORE + MONTHS_AFTER + 1 },
      (_, index) => addMonths(baseMonth, index - MONTHS_BEFORE),
    );
  });

  const [emblaRef, emblaApi] = useEmblaCarousel({
    axis: "x",
    loop: false,
    direction,
    startIndex: MONTHS_BEFORE,
  });

  const [activeIndex, setActiveIndex] = useState(MONTHS_BEFORE);
  // The month the carousel has come to rest on, activeIndex changes as soon
  // as a slide is chosen, which is too early for the Today button to go away
  const [settledIndex, setSettledIndex] = useState(MONTHS_BEFORE);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      setActiveIndex(emblaApi.selectedScrollSnap());
      setCanScrollPrev(emblaApi.canScrollPrev());
      setCanScrollNext(emblaApi.canScrollNext());
    };

    const onSettle = () => {
      setSettledIndex(emblaApi.selectedScrollSnap());
    };

    onSelect();
    onSettle();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    emblaApi.on("reInit", onSettle);
    emblaApi.on("settle", onSettle);

    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
      emblaApi.off("reInit", onSettle);
      emblaApi.off("settle", onSettle);
    };
  }, [emblaApi]);

  // Grow the window once the active slide gets close to either edge.
  // Prepending shifts every existing index, so activeIndex is bumped by the
  // same amount in the same batch - the carousel itself only finds out once
  // the reInit effect below runs.
  useEffect(() => {
    if (activeIndex <= EDGE_THRESHOLD) {
      setMonths((prev) => {
        const additional = Array.from({ length: MONTHS_GROW }, (_, index) =>
          addMonths(prev[0], index - MONTHS_GROW),
        );
        return [...additional, ...prev];
      });
      setActiveIndex((prev) => prev + MONTHS_GROW);
    } else if (activeIndex >= months.length - 1 - EDGE_THRESHOLD) {
      setMonths((prev) => {
        const additional = Array.from({ length: MONTHS_GROW }, (_, index) =>
          addMonths(prev[prev.length - 1], index + 1),
        );
        return [...prev, ...additional];
      });
    }
  }, [activeIndex, months.length]);

  // Reconcile embla with newly-inserted slide DOM nodes - a reInit alone
  // keeps the same pixel scroll offset, which after a prepend now points at
  // the wrong slide, so jump back to the (already-adjusted) active index.
  const prevMonthsLengthRef = useRef(months.length);
  useEffect(() => {
    if (!emblaApi || prevMonthsLengthRef.current === months.length) return;
    prevMonthsLengthRef.current = months.length;
    emblaApi.reInit();
    emblaApi.scrollTo(activeIndex, true);
  }, [emblaApi, months.length, activeIndex]);

  const currentIndex = months.findIndex((month) => {
    return month.getTime() === startOfMonth(new Date()).getTime();
  });

  const goToToday = () => {
    if (currentIndex < 0) {
      return;
    }
    // NOTE: A slide a few months away is reached by sliding, a far one would
    // take long to slide to, and the Today button waits for it, so it jumps
    const far = Math.abs(activeIndex - currentIndex) > FAR_MONTHS;
    emblaApi?.scrollTo(currentIndex, far);
    if (far) {
      setSettledIndex(currentIndex);
    }
  };

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  return {
    months,
    emblaRef,
    activeIndex,
    canScrollPrev,
    canScrollNext,
    scrollPrev,
    scrollNext,
    goToToday,
    todayShown: activeIndex === currentIndex && settledIndex === currentIndex,
  };
};
