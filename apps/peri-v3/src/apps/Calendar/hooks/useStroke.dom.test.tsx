// @vitest-environment jsdom
import { Temporal } from "temporal-polyfill";
import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useStroke } from "./useStroke";

const cell = (iso: string) => {
  const td = document.createElement("td");
  td.setAttribute("data-day", iso);
  document.body.appendChild(td);
  return td;
};

// jsdom has no layout, so the day under the finger is chosen by hand
const finger = (td: Element | null) => {
  document.elementFromPoint = () => td;
};

afterEach(() => {
  cleanup();
  document.body.innerHTML = "";
});

describe("useStroke", () => {
  it("tells every new day the finger comes to, once", () => {
    const { result } = renderHook(() => useStroke());
    const onDay = vi.fn<(day: Temporal.PlainDate) => void>();
    result.current(Temporal.PlainDate.from("2025-03-11"), onDay);

    finger(cell("2025-03-12"));
    act(() => {
      window.dispatchEvent(new Event("pointermove"));
      window.dispatchEvent(new Event("pointermove"));
    });
    expect(onDay).toHaveBeenCalledTimes(1);
    expect(onDay.mock.calls[0][0].toString()).toBe("2025-03-12");
  });

  it("ignores the day the stroke began on and places without a day", () => {
    const { result } = renderHook(() => useStroke());
    const onDay = vi.fn<(day: Temporal.PlainDate) => void>();
    result.current(Temporal.PlainDate.from("2025-03-11"), onDay);

    finger(cell("2025-03-11"));
    window.dispatchEvent(new Event("pointermove"));
    finger(null);
    window.dispatchEvent(new Event("pointermove"));
    expect(onDay).not.toHaveBeenCalled();
  });

  it("stops when the finger is lifted", () => {
    const { result } = renderHook(() => useStroke());
    const onDay = vi.fn<(day: Temporal.PlainDate) => void>();
    result.current(Temporal.PlainDate.from("2025-03-11"), onDay);

    window.dispatchEvent(new Event("pointerup"));
    finger(cell("2025-03-12"));
    window.dispatchEvent(new Event("pointermove"));
    expect(onDay).not.toHaveBeenCalled();
  });

  it("stops when the component goes away", () => {
    const { result, unmount } = renderHook(() => useStroke());
    const onDay = vi.fn<(day: Temporal.PlainDate) => void>();
    result.current(Temporal.PlainDate.from("2025-03-11"), onDay);

    unmount();
    finger(cell("2025-03-12"));
    window.dispatchEvent(new Event("pointermove"));
    expect(onDay).not.toHaveBeenCalled();
  });

  it("blocks touch moves while the stroke is under way", () => {
    const { result } = renderHook(() => useStroke());
    result.current(Temporal.PlainDate.from("2025-03-11"), () => {});

    const move = new Event("touchmove", { cancelable: true });
    window.dispatchEvent(move);
    expect(move.defaultPrevented).toBe(true);
  });
});
