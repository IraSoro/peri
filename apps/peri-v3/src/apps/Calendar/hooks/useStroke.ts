import { useEffect, useRef } from "react";
import { Temporal } from "temporal-polyfill";

/**
 * A stroke is a finger that moves over the days after a hold. `start` tells
 * `onDay` every day the finger comes to, until the finger is lifted. Starting
 * another stroke ends the one under way
 */
export const useStroke = () => {
  // Ends the stroke that is under way, if any
  const endStroke = useRef<() => void>(undefined);
  useEffect(() => {
    return () => {
      endStroke.current?.();
    };
  }, []);

  return (
    anchor: Temporal.PlainDate,
    onDay: (day: Temporal.PlainDate) => void,
  ) => {
    let last = anchor.toString();
    const onMove = (event: { clientX: number; clientY: number }) => {
      const iso = document
        .elementFromPoint(event.clientX, event.clientY)
        ?.closest("[data-day]")
        ?.getAttribute("data-day");
      if (!iso || iso === last) {
        return;
      }
      onDay(Temporal.PlainDate.from(iso));
      last = iso;
    };
    // NOTE: While the finger paints it must not scroll the page or swipe the
    // months, so these moves never reach the carousel
    const block = (event: Event) => {
      event.stopPropagation();
      event.preventDefault();
    };
    const end = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", end);
      window.removeEventListener("pointercancel", end);
      window.removeEventListener("touchmove", block, true);
      window.removeEventListener("mousemove", block, true);
      endStroke.current = undefined;
    };
    endStroke.current?.();
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", end);
    window.addEventListener("pointercancel", end);
    window.addEventListener("touchmove", block, {
      capture: true,
      passive: false,
    });
    window.addEventListener("mousemove", block, true);
    endStroke.current = end;
  };
};
