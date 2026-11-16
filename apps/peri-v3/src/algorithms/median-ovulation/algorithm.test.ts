import { describe, expect, it } from "vitest";
import type { Cycle } from "@repo/config-schema/config-v2.schema";
import { run } from "./algorithm";

const iso = (date: string) => {
  return `${date}T00:00:00.000Z`;
};

/** A finished cycle for tests, dates as "2025-01-01" */
const closed = (
  start: string,
  periodLength: number,
  cycleLength: number,
): Cycle => {
  return {
    start_date: iso(start),
    end_date: iso(start),
    period_length: periodLength,
    cycle_length: cycleLength,
  };
};

/** The current cycle for tests */
const open = (start: string, periodLength: number): Cycle => {
  return {
    start_date: iso(start),
    end_date: null,
    period_length: periodLength,
    cycle_length: null,
  };
};

/** The "2025-01-01" part of each predicted day */
const dates = (days: { date: string }[]) => {
  return days.map((day) => {
    return day.date.slice(0, 10);
  });
};

describe("medianOvulationAlgorithm", () => {
  it("returns no days without cycles", () => {
    expect(run({ cycles: [] })).toEqual({
      days: [],
    });
  });

  it("puts the window 14 days before the next start", () => {
    const out = run({
      cycles: [open("2025-01-01", 5)],
    });

    // Next start is Jan 29, ovulation is Jan 15, window -2..+1
    expect(dates(out.days).slice(0, 4)).toEqual([
      "2025-01-13",
      "2025-01-14",
      "2025-01-15",
      "2025-01-16",
    ]);
  });

  it("uses the median cycle length of the history", () => {
    const out = run({
      cycles: [
        closed("2025-01-01", 5, 26),
        closed("2025-01-27", 5, 30),
        closed("2025-02-26", 5, 32),
        open("2025-03-30", 5),
      ],
    });

    // Median cycle 30, ovulation of the current cycle is Mar 30 + 16 days = Apr 15
    expect(dates(out.days).slice(0, 4)).toEqual([
      "2025-04-13",
      "2025-04-14",
      "2025-04-15",
      "2025-04-16",
    ]);
  });

  it("covers the current cycle and 6 future cycles", () => {
    const out = run({
      cycles: [open("2025-01-01", 5)],
    });

    expect(out.days).toHaveLength(7 * 4);
  });
});
