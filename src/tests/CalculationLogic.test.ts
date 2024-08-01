import i18n from "i18next";
import {
  addDays,
  parseISO,
  startOfDay,
  startOfToday,
  startOfTomorrow,
  startOfYesterday,
  subDays,
  format,
} from "date-fns";
import { Cycle } from "../data/ClassCycle";
import {
  getOvulationStatus,
  getPregnancyChance,
  getDayOfCycle,
  getAverageLengthOfCycle,
  getAverageLengthOfPeriod,
  getDaysBeforePeriod,
  getPhase,
  getNewCyclesHistory,
  getActiveDates,
  getPeriodDates,
  getPeriodDatesWithNewElement,
  getLastStartDate,
  getLengthOfLastPeriod,
  getForecastPeriodDates,
  getOvulationDates,
  getPeriodDatesOfLastCycle,
} from "../state/CalculationLogics";

describe("getOvulationStatus", () => {
  test("cycles array is empty", () => {
    expect(getOvulationStatus([])).toEqual("");
  });

  test("a few days before ovulation", () => {
    // @ts-expect-error mocked `t` method
    jest.spyOn(i18n, "t").mockImplementation((key) => key);

    const cycles: Cycle[] = [];
    let date = addDays(startOfToday(), 24);

    for (let i = 0; i < 6; ++i) {
      date = subDays(date, 28);
      cycles.push({
        cycleLength: 28,
        periodLength: 6,
        startDate: date.toString(),
      });
    }
    cycles[0].cycleLength = 0;

    expect(getOvulationStatus(cycles)).toEqual(
      `${i18n.t("in")} 9 ${i18n.t("Days", {
        postProcess: "interval",
        count: 9,
      })}`,
    );
  });

  test("ovulation is tomorrow", () => {
    // @ts-expect-error mocked `t` method
    jest.spyOn(i18n, "t").mockImplementationOnce((key) => key);

    const cycles: Cycle[] = [];
    let date = addDays(startOfToday(), 16);

    for (let i = 0; i < 6; ++i) {
      date = subDays(date, 28);
      cycles.push({
        cycleLength: 28,
        periodLength: 6,
        startDate: date.toString(),
      });
    }
    cycles[0].cycleLength = 0;

    expect(getOvulationStatus(cycles)).toEqual("tomorrow");
  });

  test("ovulation is today", () => {
    // @ts-expect-error mocked `t` method
    jest.spyOn(i18n, "t").mockImplementationOnce((key) => key);

    const cycles: Cycle[] = [];
    let date: Date = addDays(startOfToday(), 15);

    for (let i = 0; i < 6; ++i) {
      date = subDays(date, 28);
      cycles.push({
        cycleLength: 28,
        periodLength: 6,
        startDate: date.toString(),
      });
    }
    cycles[0].cycleLength = 0;

    expect(getOvulationStatus(cycles)).toEqual("today");
  });

  test("if ovulation is possible", () => {
    // @ts-expect-error mocked `t` method
    jest.spyOn(i18n, "t").mockImplementationOnce((key) => key);

    const cycles: Cycle[] = [];
    let date = addDays(startOfToday(), 14);

    for (let i = 0; i < 6; ++i) {
      date = subDays(date, 28);
      cycles.push({
        cycleLength: 28,
        periodLength: 6,
        startDate: date.toString(),
      });
    }
    cycles[0].cycleLength = 0;

    expect(getOvulationStatus(cycles)).toEqual("possible");
  });

  test("ovulation is finished", () => {
    // @ts-expect-error mocked `t` method
    jest.spyOn(i18n, "t").mockImplementationOnce((key) => key);

    const cycles: Cycle[] = [];
    let date = addDays(startOfToday(), 10);

    for (let i = 0; i < 6; ++i) {
      date = subDays(date, 28);
      cycles.push({
        cycleLength: 28,
        periodLength: 6,
        startDate: date.toString(),
      });
    }
    cycles[0].cycleLength = 0;

    expect(getOvulationStatus(cycles)).toEqual("finished");
  });
});

describe("getPregnancyChance", () => {
  test("cycles array is empty", () => {
    expect(getPregnancyChance([])).toEqual("");
  });

  test("pregnancy chance is high", () => {
    // @ts-expect-error mocked `t` method
    jest.spyOn(i18n, "t").mockImplementation((key) => key);

    let date = addDays(startOfToday(), 15);
    const cycles: Cycle[] = [];

    for (let i = 0; i < 6; ++i) {
      date = subDays(date, 28);
      cycles.push({
        cycleLength: 28,
        periodLength: 6,
        startDate: date.toString(),
      });
    }
    cycles[0].cycleLength = 0;

    expect(getPregnancyChance(cycles)).toEqual("High");
  });

  test("pregnancy chance is low", () => {
    // @ts-expect-error mocked `t` method
    jest.spyOn(i18n, "t").mockImplementation((key) => key);
    let date = addDays(startOfToday(), 20);
    const cycles: Cycle[] = [];

    for (let i = 0; i < 6; ++i) {
      date = subDays(date, 28);
      cycles.push({
        cycleLength: 28,
        periodLength: 6,
        startDate: date.toString(),
      });
    }
    cycles[0].cycleLength = 0;

    expect(getPregnancyChance(cycles)).toEqual("Low");
  });
});

describe("getDayOfCycle", () => {
  test("cycles array is empty", () => {
    expect(getDayOfCycle([])).toEqual(0);
  });

  test("middle of the cycle", () => {
    // @ts-expect-error mocked `t` method
    jest.spyOn(i18n, "t").mockImplementation((key) => key);

    let date = addDays(startOfToday(), 15);

    const cycles: Cycle[] = [];

    for (let i = 0; i < 6; ++i) {
      date = subDays(date, 28);
      cycles.push({
        cycleLength: 28,
        periodLength: 6,
        startDate: date.toString(),
      });
    }
    cycles[0].cycleLength = 0;

    expect(getDayOfCycle(cycles)).toEqual(14);
  });
});

describe("getAverageLengthOfCycle", () => {
  test("cycles array is empty", () => {
    expect(getAverageLengthOfCycle([])).toEqual(0);
  });

  test("only one item in the cycles array", () => {
    // @ts-expect-error mocked `t` method
    jest.spyOn(i18n, "t").mockImplementation((key) => key);

    const cycles: Cycle[] = [
      {
        cycleLength: 28,
        periodLength: 5,
        startDate: "2023-06-30",
      },
    ];
    expect(getAverageLengthOfCycle(cycles)).toEqual(28);
  });

  test("more than one item in the cycles array", () => {
    // @ts-expect-error mocked `t` method
    jest.spyOn(i18n, "t").mockImplementation((key) => key);

    const cycles: Cycle[] = [
      {
        cycleLength: 0,
        periodLength: 6,
        startDate: "2023-06-30",
      },
      {
        cycleLength: 29,
        periodLength: 6,
        startDate: "2023-06-03",
      },
      {
        cycleLength: 27,
        periodLength: 4,
        startDate: "2023-05-07",
      },
    ];
    expect(getAverageLengthOfCycle(cycles)).toEqual(28);
  });
});

describe("getAverageLengthOfPeriod", () => {
  test("cycles array is empty", () => {
    expect(getAverageLengthOfPeriod([])).toEqual(0);
  });

  test("only one item in the cycles array", () => {
    // @ts-expect-error mocked `t` method
    jest.spyOn(i18n, "t").mockImplementation((key) => key);

    const cycles: Cycle[] = [
      {
        cycleLength: 28,
        periodLength: 5,
        startDate: "2023-06-30",
      },
    ];
    expect(getAverageLengthOfPeriod(cycles)).toEqual(5);
  });

  test("more than one item in the cycles array", () => {
    // @ts-expect-error mocked `t` method
    jest.spyOn(i18n, "t").mockImplementation((key) => key);

    const cycles: Cycle[] = [
      {
        cycleLength: 0,
        periodLength: 6,
        startDate: "2023-06-30",
      },
      {
        cycleLength: 28,
        periodLength: 6,
        startDate: "2023-06-03",
      },
      {
        cycleLength: 26,
        periodLength: 4,
        startDate: "2023-05-07",
      },
    ];
    expect(getAverageLengthOfPeriod(cycles)).toEqual(5);
  });
});

describe("getDaysBeforePeriod", () => {
  test("cycles array is empty", () => {
    // @ts-expect-error mocked `t` method
    jest.spyOn(i18n, "t").mockImplementation((key) => key);

    expect(getDaysBeforePeriod([])).toEqual({
      title: i18n.t("Period in"),
      days: i18n.t("---"),
    });
  });

  test("period in the few days", () => {
    // @ts-expect-error mocked `t` method
    jest.spyOn(i18n, "t").mockImplementation((key) => key);

    let date = addDays(startOfToday(), 10);
    const cycles: Cycle[] = [];

    for (let i = 0; i < 6; ++i) {
      date = subDays(date, 28);
      cycles.push({
        cycleLength: 28,
        periodLength: 6,
        startDate: date.toString(),
      });
    }
    cycles[0].cycleLength = 0;

    expect(getDaysBeforePeriod(cycles)).toEqual({
      title: i18n.t("Period in"),
      days: `10 ${i18n.t("Days", {
        postProcess: "interval",
        count: 10,
      })}`,
    });
  });

  test("period in 1 Day", () => {
    // @ts-expect-error mocked `t` method
    jest.spyOn(i18n, "t").mockImplementation((key) => key);

    let date = startOfTomorrow();
    const cycles: Cycle[] = [];

    for (let i = 0; i < 6; ++i) {
      date = subDays(date, 28);
      cycles.push({
        cycleLength: 28,
        periodLength: 6,
        startDate: date.toString(),
      });
    }
    cycles[0].cycleLength = 0;

    expect(getDaysBeforePeriod(cycles)).toEqual({
      title: i18n.t("Period in"),
      days: `1 ${i18n.t("Days", {
        postProcess: "interval",
        count: 1,
      })}`,
    });
  });

  test("period is today", () => {
    // @ts-expect-error mocked `t` method
    jest.spyOn(i18n, "t").mockImplementation((key) => key);

    let date = startOfToday();

    const cycles: Cycle[] = [];

    for (let i = 0; i < 6; ++i) {
      date = subDays(date, 28);
      cycles.push({
        cycleLength: 28,
        periodLength: 6,
        startDate: date.toString(),
      });
    }
    cycles[0].cycleLength = 0;

    expect(getDaysBeforePeriod(cycles)).toEqual({
      title: i18n.t("Period"),
      days: i18n.t("today"),
    });
  });

  test("cycles length is one and period is today", () => {
    // @ts-expect-error mocked `t` method
    jest.spyOn(i18n, "t").mockImplementation((key) => key);

    const date = startOfToday();

    const cycles: Cycle[] = [
      {
        cycleLength: 28,
        periodLength: 6,
        startDate: subDays(date, 28).toString(),
      },
    ];

    expect(getDaysBeforePeriod(cycles)).toEqual({
      title: i18n.t("Period is"),
      days: i18n.t("possible today"),
    });
  });

  test("delay 1 day", () => {
    // @ts-expect-error mocked `t` method
    jest.spyOn(i18n, "t").mockImplementation((key) => key);

    let date = startOfYesterday();
    const cycles: Cycle[] = [];

    for (let i = 0; i < 6; ++i) {
      date = subDays(date, 28);
      cycles.push({
        cycleLength: 28,
        periodLength: 6,
        startDate: date.toString(),
      });
    }
    cycles[0].cycleLength = 0;

    expect(getDaysBeforePeriod(cycles)).toEqual({
      title: i18n.t("Delay"),
      days: `1 ${i18n.t("Days", {
        postProcess: "interval",
        count: 1,
      })}`,
    });
  });

  test("delay a few days", () => {
    // @ts-expect-error mocked `t` method
    jest.spyOn(i18n, "t").mockImplementation((key) => key);

    let date = subDays(startOfToday(), 10);
    const cycles: Cycle[] = [];

    for (let i = 0; i < 6; ++i) {
      date = subDays(date, 28);
      cycles.push({
        cycleLength: 28,
        periodLength: 6,
        startDate: date.toString(),
      });
    }
    cycles[0].cycleLength = 0;

    expect(getDaysBeforePeriod(cycles)).toEqual({
      title: i18n.t("Delay"),
      days: `10 ${i18n.t("Days", {
        postProcess: "interval",
        count: 10,
      })}`,
    });
  });

  test("cycles length is one and delay a few days", () => {
    // @ts-expect-error mocked `t` method
    jest.spyOn(i18n, "t").mockImplementation((key) => key);

    const date = subDays(startOfToday(), 10);
    const cycles: Cycle[] = [
      {
        cycleLength: 28,
        periodLength: 6,
        startDate: subDays(date, 28).toString(),
      },
    ];

    expect(getDaysBeforePeriod(cycles)).toEqual({
      title: i18n.t("Period is"),
      days: i18n.t("possible today"),
    });
  });

  test("today is one of the days of period", () => {
    // @ts-expect-error mocked `t` method
    jest.spyOn(i18n, "t").mockImplementation((key) => key);

    let date = addDays(startOfToday(), 25);
    const cycles: Cycle[] = [];

    for (let i = 0; i < 6; ++i) {
      date = subDays(date, 28);
      cycles.push({
        cycleLength: 28,
        periodLength: 6,
        startDate: date.toString(),
      });
    }
    cycles[0].cycleLength = 0;

    expect(getDaysBeforePeriod(cycles)).toEqual({
      title: i18n.t("Period"),
      days: i18n.t("day"),
    });
  });
});

const phases = {
  non: {
    title: "",
    description: "",
    symptoms: [""],
  },
  menstrual: {
    title: "Menstrual phase",
    description: "This cycle is accompanied by low hormone levels.",
    symptoms: [
      "lack of energy and strength",
      "pain",
      "weakness and irritability",
      "increased appetite",
    ],
  },
  follicular: {
    title: "Follicular phase",
    description:
      "The level of estrogen in this phase rises and reaches a maximum level.",
    symptoms: [
      "strength and vigor appear",
      "endurance increases",
      "new ideas and plans appear",
      "libido increases",
    ],
  },
  ovulation: {
    title: "Ovulation phase",
    description:
      "Once estrogen levels peak, they trigger the release of two important ovulation hormones, follicle-stimulating hormone and luteinizing hormone.",
    symptoms: [
      "increased sexual desire",
      "optimistic mood",
      "mild fever",
      "lower abdominal pain",
      "chest discomfort and bloating",
      "characteristic secretions",
    ],
  },
  luteal: {
    title: "Luteal phase",
    description:
      "Levels of the hormones estrogen and progesterone first rise and then drop sharply just before a period. Progesterone reaches its peak in the luteal phase.",
    symptoms: [
      "breast tenderness",
      "puffiness",
      "acne and skin rashes",
      "increased appetite",
      "diarrhea or constipation",
      "irritability and depressed mood",
    ],
  },
};

describe("getPhase", () => {
  test("cycles array is empty", () => {
    // @ts-expect-error mocked `t` method
    jest.spyOn(i18n, "t").mockImplementation((key) => key);
    expect(getPhase([])).toEqual(phases.non);
  });

  test("cycle phase is menstrual", () => {
    // @ts-expect-error mocked `t` method
    jest.spyOn(i18n, "t").mockImplementation((key) => key);

    let date = addDays(startOfToday(), 26);
    const cycles: Cycle[] = [];

    for (let i = 0; i < 6; ++i) {
      date = subDays(date, 28);
      cycles.push({
        cycleLength: 28,
        periodLength: 6,
        startDate: date.toString(),
      });
    }
    cycles[0].cycleLength = 0;

    expect(getPhase(cycles)).toEqual(phases.menstrual);
  });

  test("cycle phase is follicular", () => {
    // @ts-expect-error mocked `t` method
    jest.spyOn(i18n, "t").mockImplementation((key) => key);

    let date = addDays(startOfToday(), 20);
    const cycles: Cycle[] = [];

    for (let i = 0; i < 6; ++i) {
      date = subDays(date, 28);
      cycles.push({
        cycleLength: 28,
        periodLength: 6,
        startDate: date.toString(),
      });
    }
    cycles[0].cycleLength = 0;

    expect(getPhase(cycles)).toEqual(phases.follicular);
  });

  test("cycle phase is ovulation", () => {
    // @ts-expect-error mocked `t` method
    jest.spyOn(i18n, "t").mockImplementation((key) => key);

    let date = addDays(startOfToday(), 14);
    const cycles: Cycle[] = [];

    for (let i = 0; i < 6; ++i) {
      date = subDays(date, 28);
      cycles.push({
        cycleLength: 28,
        periodLength: 6,
        startDate: date.toString(),
      });
    }
    cycles[0].cycleLength = 0;

    expect(getPhase(cycles)).toEqual(phases.ovulation);
  });

  test("cycle phase is luteal", () => {
    // @ts-expect-error mocked `t` method
    jest.spyOn(i18n, "t").mockImplementation((key) => key);

    let date = addDays(startOfToday(), 5);
    const cycles: Cycle[] = [];

    for (let i = 0; i < 6; ++i) {
      date = subDays(date, 28);
      cycles.push({
        cycleLength: 28,
        periodLength: 6,
        startDate: date.toString(),
      });
    }
    cycles[0].cycleLength = 0;

    expect(getPhase(cycles)).toEqual(phases.luteal);
  });
});

describe("getNewCyclesHistory", () => {
  test("periodDays array is empty", () => {
    // @ts-expect-error mocked `t` method
    jest.spyOn(i18n, "t").mockImplementation((key) => key);
    expect(getNewCyclesHistory([])).toEqual([]);
  });

  test("periodDays array has a clear ranges", () => {
    // @ts-expect-error mocked `t` method
    jest.spyOn(i18n, "t").mockImplementation((key) => key);

    const periodDays = [
      "2023-08-04",
      "2023-08-05",
      "2023-08-06",
      "2023-08-07",
      "2023-08-08",
      "2023-08-09",
      "2023-07-07",
      "2023-07-08",
      "2023-07-09",
      "2023-07-10",
      "2023-07-11",
      "2023-07-12",
      "2023-06-09",
      "2023-06-10",
      "2023-06-11",
      "2023-06-12",
      "2023-06-13",
      "2023-06-14",
    ];
    expect(getNewCyclesHistory(periodDays)).toEqual([
      { cycleLength: 0, periodLength: 6, startDate: "2023-08-04" },
      { cycleLength: 28, periodLength: 6, startDate: "2023-07-07" },
      { cycleLength: 28, periodLength: 6, startDate: "2023-06-09" },
    ]);
  });

  test("periodDays array has not a clear ranges", () => {
    // @ts-expect-error mocked `t` method
    jest.spyOn(i18n, "t").mockImplementation((key) => key);

    const periodDays = [
      "2023-08-04",
      "2023-08-06",
      "2023-08-08",
      "2023-08-09",
      "2023-07-07",
      "2023-07-09",
      "2023-07-11",
      "2023-07-12",
      "2023-06-09",
      "2023-06-10",
      "2023-06-12",
      "2023-06-14",
    ];
    expect(getNewCyclesHistory(periodDays)).toEqual([
      { cycleLength: 0, periodLength: 6, startDate: "2023-08-04" },
      { cycleLength: 28, periodLength: 6, startDate: "2023-07-07" },
      { cycleLength: 28, periodLength: 6, startDate: "2023-06-09" },
    ]);
  });
});

describe("getPeriodDays", () => {
  test("cycles array is empty", () => {
    // @ts-expect-error mocked `t` method
    jest.spyOn(i18n, "t").mockImplementation((key) => key);
    expect(getPeriodDates([])).toEqual([]);
  });

  test("cycles array has a few items", () => {
    // @ts-expect-error mocked `t` method
    jest.spyOn(i18n, "t").mockImplementation((key) => key);

    const cycles: Cycle[] = [
      {
        cycleLength: 0,
        periodLength: 6,
        startDate: "2023-08-05",
      },
      {
        cycleLength: 28,
        periodLength: 6,
        startDate: "2023-07-08",
      },
      {
        cycleLength: 26,
        periodLength: 4,
        startDate: "2023-06-10",
      },
    ];

    const periodDays = [
      "2023-08-05",
      "2023-08-06",
      "2023-08-07",
      "2023-08-08",
      "2023-08-09",
      "2023-08-10",
      "2023-07-08",
      "2023-07-09",
      "2023-07-10",
      "2023-07-11",
      "2023-07-12",
      "2023-07-13",
      "2023-06-10",
      "2023-06-11",
      "2023-06-12",
      "2023-06-13",
    ];

    expect(getPeriodDates(cycles)).toEqual(periodDays);
  });
});

describe("getLastPeriodDays", () => {
  test("cycles array is empty", () => {
    // @ts-expect-error mocked `t` method
    jest.spyOn(i18n, "t").mockImplementation((key) => key);
    expect(getPeriodDatesOfLastCycle([])).toEqual([]);
  });

  test("cycles array has a few items", () => {
    // @ts-expect-error mocked `t` method
    jest.spyOn(i18n, "t").mockImplementation((key) => key);

    const cycles: Cycle[] = [
      {
        cycleLength: 0,
        periodLength: 6,
        startDate: "2023-08-05",
      },
      {
        cycleLength: 28,
        periodLength: 6,
        startDate: "2023-07-08",
      },
      {
        cycleLength: 26,
        periodLength: 4,
        startDate: "2023-06-10",
      },
    ];

    const lastPeriodDays = [
      "2023-08-05",
      "2023-08-06",
      "2023-08-07",
      "2023-08-08",
      "2023-08-09",
      "2023-08-10",
    ];

    expect(getPeriodDatesOfLastCycle(cycles)).toEqual(lastPeriodDays);
  });
});

describe("getActiveDates", () => {
  test("cycles array is empty", () => {
    // @ts-expect-error mocked `t` method
    jest.spyOn(i18n, "t").mockImplementation((key) => key);

    expect(getActiveDates(startOfToday(), [])).toEqual(true);
  });

  test("now is menstrual phase items and checking 2th day of period", () => {
    // @ts-expect-error mocked `t` method
    jest.spyOn(i18n, "t").mockImplementation((key) => key);

    let date = addDays(startOfToday(), 26);
    const cycles: Cycle[] = [];

    for (let i = 0; i < 6; ++i) {
      date = subDays(date, 28);
      cycles.push({
        cycleLength: 28,
        periodLength: 6,
        startDate: date.toString(),
      });
    }
    cycles[0].cycleLength = 0;

    const dateCheck = addDays(startOfDay(new Date(cycles[0].startDate)), 1);
    expect(getActiveDates(dateCheck, cycles)).toEqual(true);
  });

  test("now is menstrual phase items and checking 8th day of cycle", () => {
    // @ts-expect-error mocked `t` method
    jest.spyOn(i18n, "t").mockImplementation((key) => key);

    let date = addDays(startOfToday(), 26);
    const cycles: Cycle[] = [];

    for (let i = 0; i < 6; ++i) {
      date = subDays(date, 28);
      cycles.push({
        cycleLength: 28,
        periodLength: 6,
        startDate: date.toString(),
      });
    }
    cycles[0].cycleLength = 0;

    const dateCheck = addDays(startOfDay(new Date(cycles[0].startDate)), 7);
    expect(getActiveDates(dateCheck, cycles)).toEqual(false);
  });

  test("now is follicular phase items and checking not day of cycle less than now", () => {
    // @ts-expect-error mocked `t` method
    jest.spyOn(i18n, "t").mockImplementation((key) => key);

    let date = addDays(startOfToday(), 20);
    const cycles: Cycle[] = [];

    for (let i = 0; i < 6; ++i) {
      date = subDays(date, 28);
      cycles.push({
        cycleLength: 28,
        periodLength: 6,
        startDate: date.toString(),
      });
    }
    cycles[0].cycleLength = 0;

    const dateCheck = addDays(startOfDay(new Date(cycles[0].startDate)), 7);
    expect(getActiveDates(dateCheck, cycles)).toEqual(true);
  });

  test("now is follicular phase items and checking not day of cycle more than now", () => {
    // @ts-expect-error mocked `t` method
    jest.spyOn(i18n, "t").mockImplementation((key) => key);

    let date = addDays(startOfToday(), 20);
    const cycles: Cycle[] = [];

    for (let i = 0; i < 6; ++i) {
      date = subDays(date, 28);
      cycles.push({
        cycleLength: 28,
        periodLength: 6,
        startDate: date.toString(),
      });
    }
    cycles[0].cycleLength = 0;

    const dateCheck = addDays(startOfDay(new Date(cycles[0].startDate)), 15);
    expect(getActiveDates(dateCheck, cycles)).toEqual(false);
  });

  test("delay a few days and check date is less then the current date", () => {
    // @ts-expect-error mocked `t` method
    jest.spyOn(i18n, "t").mockImplementation((key) => key);

    let date = subDays(startOfToday(), 5);
    const cycles: Cycle[] = [];

    for (let i = 0; i < 6; ++i) {
      date = subDays(date, 28);
      cycles.push({
        cycleLength: 28,
        periodLength: 6,
        startDate: date.toString(),
      });
    }
    cycles[0].cycleLength = 0;

    const dateCheck = addDays(startOfDay(new Date(cycles[0].startDate)), 10);
    expect(getActiveDates(dateCheck, cycles)).toEqual(true);
  });

  test("delay a few days and check date is more then the current date", () => {
    // @ts-expect-error mocked `t` method
    jest.spyOn(i18n, "t").mockImplementation((key) => key);

    let date = subDays(startOfToday(), 5);
    const cycles: Cycle[] = [];

    for (let i = 0; i < 6; ++i) {
      date = subDays(date, 28);
      cycles.push({
        cycleLength: 28,
        periodLength: 6,
        startDate: date.toString(),
      });
    }
    cycles[0].cycleLength = 0;

    const dateCheck = addDays(startOfDay(new Date(cycles[0].startDate)), 40);
    expect(getActiveDates(dateCheck, cycles)).toEqual(false);
  });
});

describe("getPastFuturePeriodDays", () => {
  test("cycles array is empty", () => {
    // @ts-expect-error mocked `t` method
    jest.spyOn(i18n, "t").mockImplementation((key) => key);

    const periodDates: string[] = [];
    const nowDate = startOfToday();
    for (let day = 0; day < 5; day++) {
      const periodDay = addDays(nowDate, day);
      periodDates.push(periodDay.toString());
    }
    expect(getPeriodDatesWithNewElement([])).toEqual(periodDates);
  });

  test("cycles array has a few items", () => {
    // @ts-expect-error mocked `t` method
    jest.spyOn(i18n, "t").mockImplementation((key) => key);

    let date = addDays(startOfToday(), 10);
    const cycles: Cycle[] = [];

    for (let i = 0; i < 6; ++i) {
      date = subDays(date, 28);
      cycles.push({
        cycleLength: 28,
        periodLength: 5,
        startDate: date.toString(),
      });
    }
    cycles[0].cycleLength = 0;

    const periodDates = getPeriodDates(cycles).map((isoDateString) => {
      return parseISO(isoDateString).toString();
    });
    const nowDate = startOfToday();
    for (let day = 0; day < 5; day++) {
      const periodDay = addDays(nowDate, day);
      periodDates.push(periodDay.toString());
    }

    expect(getPeriodDatesWithNewElement(cycles)).toEqual(periodDates);
  });

  test("delay a few days", () => {
    // @ts-expect-error mocked `t` method
    jest.spyOn(i18n, "t").mockImplementation((key) => key);

    let date = subDays(startOfToday(), 5);
    const cycles: Cycle[] = [];

    for (let i = 0; i < 6; ++i) {
      date = subDays(date, 28);
      cycles.push({
        cycleLength: 28,
        periodLength: 5,
        startDate: date.toString(),
      });
    }
    cycles[0].cycleLength = 0;

    const periodDates = getPeriodDates(cycles).map((isoDateString) => {
      return parseISO(isoDateString).toString();
    });
    const nowDate = startOfToday();

    for (let day = 0; day < 5; day++) {
      const periodDay = addDays(nowDate, day);
      periodDates.push(periodDay.toString());
    }

    expect(getPeriodDatesWithNewElement(cycles)).toEqual(periodDates);
  });
});

describe("getLastStartDate", () => {
  test("cycles array is empty", () => {
    expect(getLastStartDate([])).toEqual("");
  });

  test("cycles array has a few items", () => {
    // @ts-expect-error mocked `t` method
    jest.spyOn(i18n, "t").mockImplementation((key) => key);

    let date = addDays(startOfToday(), 15);
    const cycles: Cycle[] = [];

    for (let i = 0; i < 6; ++i) {
      date = subDays(date, 28);
      cycles.push({
        cycleLength: 28,
        periodLength: 6,
        startDate: date.toString(),
      });
    }
    cycles[0].cycleLength = 0;

    expect(getLastStartDate(cycles)).toEqual(cycles[0].startDate);
  });
});

describe("getLengthOfLastPeriod", () => {
  test("cycles array is empty", () => {
    expect(getLengthOfLastPeriod([])).toEqual(0);
  });

  test("cycles array has a few items", () => {
    // @ts-expect-error mocked `t` method
    jest.spyOn(i18n, "t").mockImplementation((key) => key);

    let date = addDays(startOfToday(), 15);
    const cycles: Cycle[] = [];

    for (let i = 0; i < 6; ++i) {
      date = subDays(date, 28);
      cycles.push({
        cycleLength: 28,
        periodLength: 6,
        startDate: date.toString(),
      });
    }
    cycles[0].cycleLength = 0;

    expect(getLengthOfLastPeriod(cycles)).toEqual(cycles[0].periodLength);
  });
});

describe("getForecastPeriodDates", () => {
  test("cycles array is empty", () => {
    // @ts-expect-error mocked `t` method
    jest.spyOn(i18n, "t").mockImplementation((key) => key);
    expect(getForecastPeriodDates([])).toEqual([]);
  });

  test("cycles array has a few items", () => {
    // @ts-expect-error mocked `t` method
    jest.spyOn(i18n, "t").mockImplementation((key) => key);

    const cycles: Cycle[] = [];
    let date = addDays(startOfToday(), 20);

    for (let i = 0; i < 6; ++i) {
      date = subDays(date, 28);
      cycles.push({
        cycleLength: 28,
        periodLength: 6,
        startDate: date.toString(),
      });
    }
    cycles[0].cycleLength = 0;

    const forecastDays = [];
    let nextCycleStart = addDays(startOfDay(new Date(cycles[0].startDate)), 28);
    for (let i = 0; i < 6; ++i) {
      forecastDays.push(format(addDays(nextCycleStart, i), "yyyy-MM-dd"));
    }

    const cycleCount = 6;
    for (let i = 0; i < cycleCount; ++i) {
      nextCycleStart = addDays(nextCycleStart, 28);
      for (let j = 0; j < 6; ++j) {
        forecastDays.push(format(addDays(nextCycleStart, j), "yyyy-MM-dd"));
      }
    }

    expect(getForecastPeriodDates(cycles)).toEqual(forecastDays);
  });
});

describe("getOvulationDates", () => {
  test("cycles array is empty", () => {
    // @ts-expect-error mocked `t` method
    jest.spyOn(i18n, "t").mockImplementation((key) => key);
    expect(getOvulationDates([])).toEqual([]);
  });

  test("cycles array has 1 item", () => {
    // @ts-expect-error mocked `t` method
    jest.spyOn(i18n, "t").mockImplementation((key) => key);

    const cycles: Cycle[] = [];
    let date = addDays(startOfToday(), 20);

    date = subDays(date, 28);
    cycles.push({
      cycleLength: 0,
      periodLength: 6,
      startDate: date.toString(),
    });

    expect(getOvulationDates(cycles)).toEqual([]);
  });

  test("cycles array has a 6 items", () => {
    // @ts-expect-error mocked `t` method
    jest.spyOn(i18n, "t").mockImplementation((key) => key);

    const cycles: Cycle[] = [];
    let date = addDays(startOfToday(), 20);

    for (let i = 0; i < 6; ++i) {
      date = subDays(date, 28);
      cycles.push({
        cycleLength: 28,
        periodLength: 6,
        startDate: date.toString(),
      });
    }
    cycles[0].cycleLength = 0;

    const ovulationDays = [];
    for (const cycle of cycles) {
      const startOfCycle = startOfDay(new Date(cycle.startDate));
      let finishOfCycle;
      if (cycle.cycleLength === 0) {
        finishOfCycle = addDays(startOfCycle, 28 - 16);
      } else {
        finishOfCycle = addDays(startOfCycle, cycle.cycleLength - 16);
      }

      for (let i = 0; i < 4; ++i) {
        const newDate = addDays(finishOfCycle, i);
        ovulationDays.push(format(newDate, "yyyy-MM-dd"));
      }
    }

    let nextCycleStart = addDays(startOfDay(new Date(cycles[0].startDate)), 28);
    for (let i = 0; i < 4; ++i) {
      ovulationDays.push(
        format(addDays(nextCycleStart, 28 - 16 + i), "yyyy-MM-dd"),
      );
    }
    for (let i = 0; i < 5; ++i) {
      nextCycleStart = addDays(nextCycleStart, 28);
      for (let i = 0; i < 4; ++i) {
        ovulationDays.push(
          format(addDays(nextCycleStart, 28 - 16 + i), "yyyy-MM-dd"),
        );
      }
    }

    expect(getOvulationDates(cycles)).toEqual(ovulationDays);
  });
});
