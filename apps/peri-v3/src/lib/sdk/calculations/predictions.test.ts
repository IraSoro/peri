import { describe, expect, it } from "vitest";
import { Temporal } from "temporal-polyfill";
import {
  currentPhase,
  dayOfPeriod,
  daysLate,
  daysUntilPeriod,
} from "./predictions";

const TODAY = Temporal.PlainDate.from("2025-01-10");

describe("daysUntilPeriod", () => {
  it("returns undefined without days", () => {
    expect(daysUntilPeriod(undefined, TODAY)).toBeUndefined();
    expect(daysUntilPeriod([], TODAY)).toBeUndefined();
  });

  it("ignores past days and picks the nearest upcoming one", () => {
    const days = [
      { date: "2025-01-05T00:00:00.000Z" },
      { date: "2025-01-25T00:00:00.000Z" },
      { date: "2025-01-22T00:00:00.000Z" },
    ];

    expect(daysUntilPeriod(days, TODAY)).toBe(12);
  });

  it("returns 0 when a day is today", () => {
    expect(daysUntilPeriod([{ date: "2025-01-10T00:00:00.000Z" }], TODAY)).toBe(
      0,
    );
  });
});

const at = (...dates: string[]) => {
  return dates.map((date) => {
    return { date: `${date}T00:00:00.000Z` };
  });
};

const predictions = (menstruation: string[], ovulation: string[]) => {
  return {
    menstruation: { algorithm_id: "a", days: at(...menstruation) },
    ovulation: { algorithm_id: "b", days: at(...ovulation) },
  };
};

describe("dayOfPeriod", () => {
  it("returns undefined when today is not a predicted day", () => {
    expect(dayOfPeriod(at("2025-01-11"), TODAY)).toBeUndefined();
    expect(dayOfPeriod(undefined, TODAY)).toBeUndefined();
  });

  it("counts the consecutive days up to today", () => {
    const days = at("2025-01-08", "2025-01-09", "2025-01-10", "2025-01-11");

    expect(dayOfPeriod(days, TODAY)).toBe(3);
  });

  it("starts again after a gap", () => {
    expect(dayOfPeriod(at("2025-01-08", "2025-01-10"), TODAY)).toBe(1);
  });
});

const logged = (start: string) => {
  return {
    start_date: `${start}T00:00:00.000Z`,
    end_date: null,
    period_length: 5,
    cycle_length: null,
  };
};

describe("daysLate", () => {
  it("counts the days since the predicted start", () => {
    const days = at("2025-01-08", "2025-01-09", "2025-02-05");

    expect(daysLate(days, [logged("2024-12-10")], TODAY)).toBe(2);
  });

  it("is undefined while the predicted start is not past", () => {
    expect(daysLate(at("2025-01-10"), [logged("2024-12-10")], TODAY)).toBe(
      undefined,
    );
    expect(daysLate(at("2025-01-12"), [logged("2024-12-10")], TODAY)).toBe(
      undefined,
    );
  });

  it("ignores the period of the logged cycle itself", () => {
    expect(daysLate(at("2025-01-08"), [logged("2025-01-08")], TODAY)).toBe(
      undefined,
    );
  });

  it("is undefined without cycles or predictions", () => {
    expect(daysLate(at("2025-01-08"), [], TODAY)).toBeUndefined();
    expect(daysLate(undefined, [logged("2024-12-10")], TODAY)).toBeUndefined();
  });
});

describe("currentPhase", () => {
  it("is luteal while the period is late", () => {
    const late = predictions(["2025-01-08", "2025-01-09", "2025-01-10"], []);

    expect(currentPhase(late, [logged("2024-12-10")], TODAY)).toBe("luteal");
  });

  it("is menstrual on a predicted period day", () => {
    const all = predictions(["2025-01-09", "2025-01-10"], ["2025-01-24"]);

    expect(currentPhase(all, [logged("2025-01-09")], TODAY)).toBe("menstrual");
  });

  it("is ovulation on a predicted ovulation day", () => {
    expect(
      currentPhase(
        predictions(["2025-02-01"], ["2025-01-10"]),
        [logged("2025-01-01")],
        TODAY,
      ),
    ).toBe("ovulation");
  });

  it("is follicular while the ovulation is still ahead", () => {
    expect(
      currentPhase(
        predictions(["2025-02-01"], ["2025-01-20"]),
        [logged("2025-01-01")],
        TODAY,
      ),
    ).toBe("follicular");
  });

  it("is luteal once the ovulation has passed", () => {
    expect(
      currentPhase(
        predictions(["2025-02-01"], ["2025-01-05"]),
        [logged("2025-01-01")],
        TODAY,
      ),
    ).toBe("luteal");
  });

  it("is follicular without ovulation predictions", () => {
    expect(currentPhase({}, [], TODAY)).toBe("follicular");
  });
});
