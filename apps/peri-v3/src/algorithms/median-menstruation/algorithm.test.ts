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

describe("medianMenstruationAlgorithm", () => {
  it("returns no days without cycles", () => {
    expect(run({ cycles: [] })).toEqual({
      days: [],
    });
  });

  it("falls back to 28 days with one open cycle", () => {
    const out = run({
      cycles: [open("2025-01-01", 4)],
    });

    // Next start is Jan 29, the period length is the median of the history, 4
    expect(dates(out.days).slice(0, 4)).toEqual([
      "2025-01-29",
      "2025-01-30",
      "2025-01-31",
      "2025-02-01",
    ]);
  });

  it("uses the median cycle and period length of the history", () => {
    const out = run({
      cycles: [
        closed("2025-01-01", 4, 26),
        closed("2025-01-27", 5, 30),
        closed("2025-02-26", 6, 28),
        open("2025-03-26", 5),
      ],
    });

    // Median cycle 28 and median period 5: next start is Apr 23
    expect(dates(out.days).slice(0, 5)).toEqual([
      "2025-04-23",
      "2025-04-24",
      "2025-04-25",
      "2025-04-26",
      "2025-04-27",
    ]);
  });

  it("rounds the median of an even count up to a whole day", () => {
    const out = run({
      cycles: [
        closed("2025-01-01", 5, 27),
        closed("2025-01-28", 5, 30),
        open("2025-02-27", 5),
      ],
    });

    // Median of 27 and 30 is 28.5, rounded to 29: next start is Mar 28
    expect(dates(out.days)[0]).toBe("2025-03-28");
  });

  it("predicts 6 future periods and none for the current cycle", () => {
    const out = run({
      cycles: [open("2025-01-01", 5)],
    });

    expect(out.days).toHaveLength(6 * 5);
    expect(dates(out.days)).not.toContain("2025-01-01");
  });

  it("keeps the dates as ISO instants with milliseconds", () => {
    const out = run({
      cycles: [open("2025-01-01", 5)],
    });

    expect(out.days[0]?.date).toBe("2025-01-29T00:00:00.000Z");
  });
});
