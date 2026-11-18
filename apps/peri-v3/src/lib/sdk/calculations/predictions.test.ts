import { describe, expect, it } from "vitest";
import { Temporal } from "temporal-polyfill";
import { periodStatus, phasesByDay } from "./predictions";

const TODAY = Temporal.PlainDate.from("2025-01-10");

const at = (...dates: string[]) => {
  return dates.map((date) => {
    return { date: `${date}T00:00:00.000Z` };
  });
};

const predictions = (menstruation: string[], ovulation: string[] = []) => {
  return {
    menstruation: { algorithm_id: "a", days: at(...menstruation) },
    ovulation: { algorithm_id: "b", days: at(...ovulation) },
  };
};

const logged = (start: string) => {
  return {
    start_date: `${start}T00:00:00.000Z`,
    end_date: null,
    period_length: 5,
    cycle_length: null,
  };
};

/** The status for a logged cycle start and predicted days, today is Jan 10 */
const status = (
  start: string | undefined,
  menstruation: string[],
  ovulation: string[] = [],
) => {
  return periodStatus(
    predictions(menstruation, ovulation),
    start ? [logged(start)] : [],
    TODAY,
  );
};

describe("periodStatus daysUntilPeriod", () => {
  it("is undefined without days", () => {
    expect(periodStatus({}, [], TODAY).daysUntilPeriod).toBeUndefined();
    expect(status("2024-12-10", []).daysUntilPeriod).toBeUndefined();
  });

  it("ignores past days and picks the nearest upcoming one", () => {
    const out = status("2025-01-01", [
      "2025-01-05",
      "2025-01-25",
      "2025-01-22",
    ]);

    expect(out.daysUntilPeriod).toBe(12);
  });

  it("is 0 when a day is today", () => {
    expect(status("2025-01-01", ["2025-01-10"]).daysUntilPeriod).toBe(0);
  });
});

describe("periodStatus dayOfPeriod", () => {
  it("is undefined when today is not a predicted day", () => {
    expect(status("2025-01-01", ["2025-01-11"]).dayOfPeriod).toBeUndefined();
    expect(periodStatus({}, [], TODAY).dayOfPeriod).toBeUndefined();
  });

  it("counts the consecutive days up to today", () => {
    const days = ["2025-01-08", "2025-01-09", "2025-01-10", "2025-01-11"];

    expect(status("2025-01-08", days).dayOfPeriod).toBe(3);
  });

  it("starts again after a gap", () => {
    expect(status("2025-01-01", ["2025-01-08", "2025-01-10"]).dayOfPeriod).toBe(
      1,
    );
  });
});

describe("periodStatus late", () => {
  it("counts the days since the predicted start", () => {
    const days = ["2025-01-08", "2025-01-09", "2025-02-05"];

    expect(status("2024-12-10", days).late).toBe(2);
  });

  it("is undefined while the predicted start is not past", () => {
    expect(status("2024-12-10", ["2025-01-10"]).late).toBeUndefined();
    expect(status("2024-12-10", ["2025-01-12"]).late).toBeUndefined();
  });

  it("ignores the period of the logged cycle itself", () => {
    expect(status("2025-01-08", ["2025-01-08"]).late).toBeUndefined();
  });

  it("is undefined without cycles or predictions", () => {
    expect(status(undefined, ["2025-01-08"]).late).toBeUndefined();
    expect(
      periodStatus({}, [logged("2024-12-10")], TODAY).late,
    ).toBeUndefined();
  });
});

describe("periodStatus phase", () => {
  it("is luteal while the period is late", () => {
    const days = ["2025-01-08", "2025-01-09", "2025-01-10"];

    expect(status("2024-12-10", days).phase).toBe("luteal");
  });

  it("is menstrual on a predicted period day", () => {
    const out = status(
      "2025-01-09",
      ["2025-01-09", "2025-01-10"],
      ["2025-01-24"],
    );

    expect(out.phase).toBe("menstrual");
  });

  it("is ovulation on a predicted ovulation day", () => {
    expect(status("2025-01-01", ["2025-02-01"], ["2025-01-10"]).phase).toBe(
      "ovulation",
    );
  });

  it("is follicular while the ovulation is still ahead", () => {
    expect(status("2025-01-01", ["2025-02-01"], ["2025-01-20"]).phase).toBe(
      "follicular",
    );
  });

  it("is luteal once the ovulation has passed", () => {
    expect(status("2025-01-01", ["2025-02-01"], ["2025-01-05"]).phase).toBe(
      "luteal",
    );
  });

  it("is follicular without ovulation predictions", () => {
    expect(periodStatus({}, [], TODAY).phase).toBe("follicular");
  });
});

describe("phasesByDay", () => {
  const logged = [
    {
      start_date: "2025-01-01T00:00:00.000Z",
      end_date: null,
      period_length: 3,
      cycle_length: null,
    },
  ];

  it("is empty without cycles or a next period", () => {
    expect(phasesByDay({}, [])).toEqual([]);
    expect(phasesByDay({}, logged)).toEqual([]);
  });

  it("gives a phase to every day up to the next period", () => {
    const phases = phasesByDay(
      {
        menstruation: {
          algorithm_id: "a",
          days: at("2025-01-01", "2025-01-09"),
        },
        ovulation: { algorithm_id: "b", days: at("2025-01-05", "2025-01-06") },
      },
      logged,
    );

    expect(phases).toEqual([
      "menstrual",
      "menstrual",
      "menstrual",
      "follicular",
      "ovulation",
      "ovulation",
      "luteal",
      "luteal",
    ]);
  });

  it("is follicular after the period when there is no ovulation", () => {
    const phases = phasesByDay(
      {
        menstruation: {
          algorithm_id: "a",
          days: at("2025-01-01", "2025-01-06"),
        },
      },
      logged,
    );

    expect(phases).toEqual([
      "menstrual",
      "menstrual",
      "menstrual",
      "follicular",
      "follicular",
    ]);
  });
});
