import { Temporal } from "temporal-polyfill";
import { describe, expect, it } from "vitest";
import {
  containsDay,
  markDay,
  tapDay,
  unmarkDay,
  type Period,
} from "./periods";

const day = (iso: string) => {
  return Temporal.PlainDate.from(iso);
};

const period = (start: string, length: number): Period => {
  return { start: day(start), length };
};

const text = (periods: Period[]) => {
  return periods
    .map((p) => {
      return `${p.start.toString()}+${p.length}`;
    })
    .sort();
};

describe("containsDay", () => {
  it("includes the first and the last day of a period", () => {
    const periods = [period("2025-03-10", 3)];
    expect(containsDay(periods, day("2025-03-10"))).toBe(true);
    expect(containsDay(periods, day("2025-03-12"))).toBe(true);
  });

  it("excludes the days around a period", () => {
    const periods = [period("2025-03-10", 3)];
    expect(containsDay(periods, day("2025-03-09"))).toBe(false);
    expect(containsDay(periods, day("2025-03-13"))).toBe(false);
  });
});

describe("unmarkDay", () => {
  it("splits a period in two when a middle day is taken out", () => {
    const next = unmarkDay([period("2025-03-27", 5)], day("2025-03-29"));
    expect(text(next)).toEqual(["2025-03-27+2", "2025-03-30+2"]);
  });

  it("shortens a period at either end", () => {
    expect(
      text(unmarkDay([period("2025-03-10", 3)], day("2025-03-10"))),
    ).toEqual(["2025-03-11+2"]);
    expect(
      text(unmarkDay([period("2025-03-10", 3)], day("2025-03-12"))),
    ).toEqual(["2025-03-10+2"]);
  });

  it("removes a period of one day", () => {
    expect(unmarkDay([period("2025-03-10", 1)], day("2025-03-10"))).toEqual([]);
  });

  it("changes nothing outside the periods", () => {
    const periods = [period("2025-03-10", 3)];
    expect(unmarkDay(periods, day("2025-03-20"))).toBe(periods);
  });
});

describe("markDay", () => {
  it("makes a period of one day", () => {
    expect(text(markDay([], day("2025-03-10")))).toEqual(["2025-03-10+1"]);
  });

  it("extends the period that ends the day before", () => {
    expect(text(markDay([period("2025-03-10", 3)], day("2025-03-13")))).toEqual(
      ["2025-03-10+4"],
    );
  });

  it("extends the period that starts the day after", () => {
    expect(text(markDay([period("2025-03-10", 3)], day("2025-03-09")))).toEqual(
      ["2025-03-09+4"],
    );
  });

  it("joins two periods that the day sits between", () => {
    const periods = [period("2025-03-10", 2), period("2025-03-13", 2)];
    expect(text(markDay(periods, day("2025-03-12")))).toEqual(["2025-03-10+5"]);
  });

  it("changes nothing for a day that is marked", () => {
    const periods = [period("2025-03-10", 3)];
    expect(markDay(periods, day("2025-03-11"))).toBe(periods);
  });
});

describe("tapDay", () => {
  it("marks an empty day and takes a marked one out", () => {
    const marked = tapDay([], day("2025-03-10"));
    expect(text(marked)).toEqual(["2025-03-10+1"]);
    expect(tapDay(marked, day("2025-03-10"))).toEqual([]);
  });
});
