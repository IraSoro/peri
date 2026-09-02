import { useCallback, useLayoutEffect, useRef } from "react";

const DEFAULT_DURATION = 200;

type UseHeightTransitionOptions = {
  duration?: number;
  /**
   * Height to collapse to when `open` is false. Omit this when both states
   * render real (non-empty) content whose height should always be measured
   * fresh - e.g. expandable text swapping between truncated and full copy.
   * Pass 0 (the default) for panels that fully hide when closed but keep
   * their children mounted, e.g. Accordion/Collapsible.
   */
  collapsedHeight?: number;
};

export function useHeightTransition(
  open: boolean,
  options: UseHeightTransitionOptions = {},
) {
  const { duration = DEFAULT_DURATION, collapsedHeight } = options;
  const ref = useRef<HTMLDivElement>(null);
  const isFirstRenderRef = useRef(true);
  const capturedHeightRef = useRef<number | null>(null);

  // Callers whose content actually changes on toggle (e.g. show more/less
  // swapping truncated/full text) must call this synchronously before
  // triggering the state update, so the "before" height is captured while
  // the old content is still in the DOM.
  const captureHeight = useCallback(() => {
    if (ref.current) {
      capturedHeightRef.current = ref.current.scrollHeight;
    }
  }, []);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) {
      return;
    }

    const usesFixedCollapse = collapsedHeight !== undefined;

    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      el.style.transition = "none";
      el.style.height =
        open || !usesFixedCollapse ? "auto" : `${collapsedHeight}px`;
      return;
    }

    el.style.transition = "none";

    // Measure the natural height of whatever content is *currently*
    // rendered (post-commit) before constraining the box to a start
    // height - scrollHeight can't report a value smaller than the box's
    // own explicit height, so measuring after setting the start height
    // would just echo it back.
    el.style.height = "auto";
    const naturalHeight = el.scrollHeight;
    const targetHeight =
      open || !usesFixedCollapse ? naturalHeight : collapsedHeight;

    const startHeight =
      capturedHeightRef.current ??
      (open ? (collapsedHeight ?? 0) : naturalHeight);
    capturedHeightRef.current = null;

    el.style.height = `${startHeight}px`;
    // Force a reflow so the browser registers the start height before we
    // switch on the transition and change the target height.
    void el.offsetHeight;
    el.style.transition = `height ${duration}ms ease-out`;
    el.style.height = `${targetHeight}px`;

    const handleTransitionEnd = (event: TransitionEvent) => {
      if (event.target !== el || event.propertyName !== "height") {
        return;
      }
      if (open || !usesFixedCollapse) {
        el.style.height = "auto";
      }
    };

    el.addEventListener("transitionend", handleTransitionEnd);
    return () => el.removeEventListener("transitionend", handleTransitionEnd);
  }, [open, duration, collapsedHeight]);

  return { ref, captureHeight };
}
