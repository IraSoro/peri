import { describe, expect, it } from "vitest";
import type { Cycle } from "@repo/config-schema/config-v2.schema";
import { Temporal } from "temporal-polyfill";
import { cycleStats, dayOfCycle, historyAt, pastPhasesByDay } from "./cycles";

const cycle = (periodLength: number, cycleLength: number | null): Cycle => {
  return {
    start_date: "2025-01-01T00:00:00.000Z",
    end_date: null,
    period_length: periodLength,
    cycle_length: cycleLength,
  };
};

describe("cycleStats", () => {
  it("returns nothing without cycles", () => {
    expect(cycleStats([])).toEqual({
      cycleLength: undefined,
      periodLength: undefined,
    });
  });

  it("has no cycle length while only the open cycle exists", () => {
    expect(cycleStats([cycle(5, null)])).toEqual({
      cycleLength: undefined,
      periodLength: 5,
    });
  });

  it("averages finished cycles and reports the largest deviation", () => {
    const stats = cycleStats([cycle(5, 26), cycle(7, 30), cycle(6, null)]);

    expect(stats.cycleLength).toEqual({ average: 28, deviation: 2 });
    expect(stats.periodLength).toBe(6);
  });
});

describe("dayOfCycle", () => {
  const today = Temporal.PlainDate.from("2025-01-10");

  it("counts the start day as day 1", () => {
    expect(
      dayOfCycle(cycle(5, null), Temporal.PlainDate.from("2025-01-01")),
    ).toBe(1);
  });

  it("counts the days since the cycle started", () => {
    expect(dayOfCycle(cycle(5, null), today)).toBe(10);
  });
});

describe("pastPhasesByDay", () => {
  // Jan 5 to Jan 8, the window of a 20 day cycle that started on Jan 1
  const ovulation = ["05", "06", "07", "08"].map((day) => {
    return { date: `2025-01-${day}T00:00:00.000Z` };
  });

  it("is empty for the open cycle", () => {
    expect(pastPhasesByDay(cycle(5, null), ovulation)).toEqual([]);
  });

  it("puts the phases around the predicted ovulation days", () => {
    const phases = pastPhasesByDay(cycle(3, 20), ovulation);

    expect(phases).toHaveLength(20);
    expect(phases.slice(0, 3)).toEqual(["menstrual", "menstrual", "menstrual"]);
    expect(phases.slice(3, 4)).toEqual(["follicular"]);
    expect(phases.slice(4, 8)).toEqual(Array(4).fill("ovulation"));
    expect(phases.slice(8)).toEqual(Array(12).fill("luteal"));
  });

  it("has no ovulation without predicted days", () => {
    const phases = pastPhasesByDay(cycle(3, 20), []);

    expect(phases).not.toContain("ovulation");
    expect(phases).not.toContain("luteal");
  });
});

describe("historyAt", () => {
  const older = { ...cycle(5, 28), start_date: "2024-12-04T00:00:00.000Z" };
  const target = { ...cycle(5, 28), end_date: "2025-01-29T00:00:00.000Z" };
  const newer = { ...cycle(5, null), start_date: "2025-01-29T00:00:00.000Z" };

  it("keeps the earlier cycles and opens the cycle itself", () => {
    expect(historyAt([older, target, newer], target)).toEqual([
      older,
      { ...target, end_date: null, cycle_length: null },
    ]);
  });

  it("is empty for a cycle that is not logged", () => {
    expect(historyAt([older], target)).toEqual([]);
  });
});
