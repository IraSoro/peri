import { type PointerEvent, useEffect, useRef } from "react";

// How long a day is pressed to count as a hold
export const HOLD_MS = 450;
// A hold on a day in edit mode, which starts marking or clearing days, is quicker
export const PAINT_HOLD_MS = 300;
// How long before a press shows that it may become a hold
export const HOLD_SHOW_MS = 150;
// How far a finger may move during a press, in pixels
const HOLD_MOVE_PX = 10;

/**
 * Pointer handlers that turn a press held for `holdMs` into `onHold`.
 * `onChange` tells when a hold may be under way, which starts a moment after
 * the press so a plain tap does not show it. A press that moves is a swipe or
 * a slip, it cancels the hold. `consumeClick` tells the click that ends a hold
 * or a swipe, which is not a tap
 */
export const useHold = (
  onHold: () => void,
  onChange: (holding: boolean) => void,
  holdMs: number,
) => {
  const holdTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const indicatorTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const start = useRef({ x: 0, y: 0 });
  const ignoreClick = useRef(false);
  const pressing = useRef(false);

  const cancel = () => {
    pressing.current = false;
    clearTimeout(holdTimer.current);
    clearTimeout(indicatorTimer.current);
    onChange(false);
  };

  useEffect(() => {
    return () => {
      clearTimeout(holdTimer.current);
      clearTimeout(indicatorTimer.current);
    };
  }, []);

  return {
    handlers: {
      onPointerDown: (event: PointerEvent<HTMLElement>) => {
        ignoreClick.current = false;
        pressing.current = true;
        start.current = { x: event.clientX, y: event.clientY };
        indicatorTimer.current = setTimeout(() => {
          onChange(true);
        }, HOLD_SHOW_MS);
        holdTimer.current = setTimeout(() => {
          pressing.current = false;
          ignoreClick.current = true;
          onChange(false);
          onHold();
        }, holdMs);
      },
      onPointerMove: (event: PointerEvent<HTMLElement>) => {
        if (!pressing.current) {
          return;
        }
        const moved = Math.hypot(
          event.clientX - start.current.x,
          event.clientY - start.current.y,
        );
        if (moved > HOLD_MOVE_PX) {
          ignoreClick.current = true;
          cancel();
        }
      },
      onPointerUp: cancel,
      onPointerLeave: cancel,
      onPointerCancel: cancel,
    },
    consumeClick: () => {
      const ignored = ignoreClick.current;
      ignoreClick.current = false;
      return ignored;
    },
  };
};
