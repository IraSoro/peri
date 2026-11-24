// @vitest-environment jsdom
import { Temporal } from "temporal-polyfill";
import { renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useCalendarModifiers } from "./useCalendarModifiers";

const predictions = vi.hoisted(() => {
  return { current: {} };
});

vi.mock("@/lib/sdk/app/hooks", () => {
  return {
    usePredictions: () => {
      return predictions.current;
    },
  };
});

const today = Temporal.Now.plainDateISO();

/** The days from `start`, as the prediction days of the algorithm */
const run = (offset: number, length: number) => {
  return Array.from({ length }, (_, index) => {
    const day = today.add({ days: offset + index });
    return { date: `${day.toString()}T12:00:00.000Z` };
  });
};

const at = (offset: number) => {
  const day = today.add({ days: offset });
  return new Date(`${day.toString()}T12:00:00`);
};

afterEach(() => {
  predictions.current = {};
});

describe("useCalendarModifiers", () => {
  it("does not show predicted days that have passed", () => {
    // A wrong mark 40 days ago left predictions for 12 days ago and for next
    // month
    predictions.current = {
      menstruation: { days: [...run(-40, 5), ...run(-12, 5), ...run(16, 5)] },
      ovulation: { days: [...run(-20, 3), ...run(5, 3)] },
    };
    const { result } = renderHook(() => {
      return useCalendarModifiers(
        [{ start: today.subtract({ days: 40 }), length: 5 }],
        false,
      );
    });

    expect(result.current.menstrual(at(-40))).toBe(true);
    expect(result.current.menstrual(at(-12))).toBe(false);
    expect(result.current.menstrual(at(16))).toBe(true);
    expect(result.current.ovulation(at(-20))).toBe(false);
    expect(result.current.ovulation(at(5))).toBe(true);
  });
});
