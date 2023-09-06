import i18n from "i18next";
import { Cycle } from "../data/ClassCycle";
import { format } from "date-fns";
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
  getLastPeriodDays,
  getMarkModalActiveDates,
  getPastFuturePeriodDays,
  getLastStartDate,
  getLengthOfLastPeriod,
} from "../state/CalculationLogics";

describe("getOvulationStatus", () => {
  test("cycles array is empty", () => {
    expect(getOvulationStatus([])).toEqual("");
  });

  test("a few days before ovulation", () => {
    // @ts-expect-error mocked `t` method
    jest.spyOn(i18n, "t").mockImplementation((key) => key);
    const date: Date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + 24);

    const cycles: Cycle[] = [];

    for (let i = 0; i < 6; ++i) {
      date.setDate(date.getDate() - 28);
      cycles.push({
        cycleLength: 28,
        periodLength: 6,
        startDate: date.toString(),
      });
    }
    expect(getOvulationStatus(cycles)).toEqual(
      `${i18n.t("in")} 9 ${i18n.t("Days_interval", {
        postProcess: "interval",
        count: 9,
      })}`,
    );
  });

  test("ovulation is tomorrow", () => {
    // @ts-expect-error mocked `t` method
    jest.spyOn(i18n, "t").mockImplementationOnce((key) => key);
    const date: Date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + 16);

    const cycles: Cycle[] = [];

    for (let i = 0; i < 6; ++i) {
      date.setDate(date.getDate() - 28);
      cycles.push({
        cycleLength: 28,
        periodLength: 6,
        startDate: date.toString(),
      });
    }
    expect(getOvulationStatus(cycles)).toEqual("tomorrow");
  });

  test("ovulation is today", () => {
    // @ts-expect-error mocked `t` method
    jest.spyOn(i18n, "t").mockImplementationOnce((key) => key);
    const date: Date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + 15);

    const cycles: Cycle[] = [];

    for (let i = 0; i < 6; ++i) {
      date.setDate(date.getDate() - 28);
      cycles.push({
        cycleLength: 28,
        periodLength: 6,
        startDate: date.toString(),
      });
    }
    expect(getOvulationStatus(cycles)).toEqual("today");
  });

  test("if ovulation is possible", () => {
    // @ts-expect-error mocked `t` method
    jest.spyOn(i18n, "t").mockImplementationOnce((key) => key);
    const date: Date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + 14);

    const cycles: Cycle[] = [];

    for (let i = 0; i < 6; ++i) {
      date.setDate(date.getDate() - 28);
      cycles.push({
        cycleLength: 28,
        periodLength: 6,
        startDate: date.toString(),
      });
    }
    expect(getOvulationStatus(cycles)).toEqual("possible");
  });

  test("ovulation is finished", () => {
    // @ts-expect-error mocked `t` method
    jest.spyOn(i18n, "t").mockImplementationOnce((key) => key);
    const date: Date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + 10);

    const cycles: Cycle[] = [];

    for (let i = 0; i < 6; ++i) {
      date.setDate(date.getDate() - 28);
      cycles.push({
        cycleLength: 28,
        periodLength: 6,
        startDate: date.toString(),
      });
    }
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

    const date: Date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + 15);

    const cycles: Cycle[] = [];

    for (let i = 0; i < 6; ++i) {
      date.setDate(date.getDate() - 28);
      cycles.push({
        cycleLength: 28,
        periodLength: 6,
        startDate: date.toString(),
      });
    }
    expect(getPregnancyChance(cycles)).toEqual("High");
  });

  test("pregnancy chance is low", () => {
    // @ts-expect-error mocked `t` method
    jest.spyOn(i18n, "t").mockImplementation((key) => key);
    const date: Date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + 20);

    const cycles: Cycle[] = [];

    for (let i = 0; i < 6; ++i) {
      date.setDate(date.getDate() - 28);
      cycles.push({
        cycleLength: 28,
        periodLength: 6,
        startDate: date.toString(),
      });
    }
    expect(getPregnancyChance(cycles)).toEqual("Low");
  });
});

describe("getDayOfCycle", () => {
  test("cycles array is empty", () => {
    expect(getDayOfCycle([])).toEqual("");
  });

  test("middle of the cycle", () => {
    // @ts-expect-error mocked `t` method
    jest.spyOn(i18n, "t").mockImplementation((key) => key);

    const date: Date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + 15);

    const cycles: Cycle[] = [];

    for (let i = 0; i < 6; ++i) {
      date.setDate(date.getDate() - 28);
      cycles.push({
        cycleLength: 28,
        periodLength: 6,
        startDate: date.toString(),
      });
    }

    expect(getDayOfCycle(cycles)).toEqual("14");
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

    const date: Date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + 10);

    const cycles: Cycle[] = [];

    for (let i = 0; i < 6; ++i) {
      date.setDate(date.getDate() - 28);
      cycles.push({
        cycleLength: 28,
        periodLength: 6,
        startDate: date.toString(),
      });
    }

    expect(getDaysBeforePeriod(cycles)).toEqual({
      title: i18n.t("Period in"),
      days: `10 ${i18n.t("Days_interval", {
        postProcess: "interval",
        count: 10,
      })}`,
    });
  });

  test("period in 1 Day", () => {
    // @ts-expect-error mocked `t` method
    jest.spyOn(i18n, "t").mockImplementation((key) => key);

    const date: Date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + 1);

    const cycles: Cycle[] = [];

    for (let i = 0; i < 6; ++i) {
      date.setDate(date.getDate() - 28);
      cycles.push({
        cycleLength: 28,
        periodLength: 6,
        startDate: date.toString(),
      });
    }

    expect(getDaysBeforePeriod(cycles)).toEqual({
      title: i18n.t("Period in"),
      days: `1 ${i18n.t("Days_interval", {
        postProcess: "interval",
        count: 1,
      })}`,
    });
  });

  test("period is today", () => {
    // @ts-expect-error mocked `t` method
    jest.spyOn(i18n, "t").mockImplementation((key) => key);

    const date: Date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate());

    const cycles: Cycle[] = [];

    for (let i = 0; i < 6; ++i) {
      date.setDate(date.getDate() - 28);
      cycles.push({
        cycleLength: 28,
        periodLength: 6,
        startDate: date.toString(),
      });
    }

    expect(getDaysBeforePeriod(cycles)).toEqual({
      title: i18n.t("Period"),
      days: i18n.t("today"),
    });
  });

  test("delay 1 day", () => {
    // @ts-expect-error mocked `t` method
    jest.spyOn(i18n, "t").mockImplementation((key) => key);

    const date: Date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - 1);

    const cycles: Cycle[] = [];

    for (let i = 0; i < 6; ++i) {
      date.setDate(date.getDate() - 28);
      cycles.push({
        cycleLength: 28,
        periodLength: 6,
        startDate: date.toString(),
      });
    }

    expect(getDaysBeforePeriod(cycles)).toEqual({
      title: i18n.t("Delay"),
      days: `1 ${i18n.t("Days_interval", {
        postProcess: "interval",
        count: 1,
      })}`,
    });
  });

  test("delay a few days", () => {
    // @ts-expect-error mocked `t` method
    jest.spyOn(i18n, "t").mockImplementation((key) => key);

    const date: Date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - 10);

    const cycles: Cycle[] = [];

    for (let i = 0; i < 6; ++i) {
      date.setDate(date.getDate() - 28);
      cycles.push({
        cycleLength: 28,
        periodLength: 6,
        startDate: date.toString(),
      });
    }

    expect(getDaysBeforePeriod(cycles)).toEqual({
      title: i18n.t("Delay"),
      days: `10 ${i18n.t("Days_interval", {
        postProcess: "interval",
        count: 10,
      })}`,
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
    expect(getPhase(0, 0, 0)).toEqual(phases.non);
  });

  test("cycle phase is menstrual", () => {
    // @ts-expect-error mocked `t` method
    jest.spyOn(i18n, "t").mockImplementation((key) => key);
    expect(getPhase(28, 5, 1)).toEqual(phases.menstrual);
  });

  test("cycle phase is follicular", () => {
    // @ts-expect-error mocked `t` method
    jest.spyOn(i18n, "t").mockImplementation((key) => key);
    expect(getPhase(28, 5, 7)).toEqual(phases.follicular);
  });

  test("cycle phase is ovulation", () => {
    // @ts-expect-error mocked `t` method
    jest.spyOn(i18n, "t").mockImplementation((key) => key);
    expect(getPhase(28, 5, 14)).toEqual(phases.ovulation);
  });

  test("cycle phase is luteal", () => {
    // @ts-expect-error mocked `t` method
    jest.spyOn(i18n, "t").mockImplementation((key) => key);
    expect(getPhase(28, 5, 21)).toEqual(phases.luteal);
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

describe("getLastPeriodDays", () => {
  test("cycles array is empty", () => {
    // @ts-expect-error mocked `t` method
    jest.spyOn(i18n, "t").mockImplementation((key) => key);
    expect(getLastPeriodDays([])).toEqual([]);
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

    expect(getLastPeriodDays(cycles)).toEqual(periodDays);
  });
});

describe("getActiveDates", () => {
  test("cycles array is empty", () => {
    // @ts-expect-error mocked `t` method
    jest.spyOn(i18n, "t").mockImplementation((key) => key);
    expect(getActiveDates("", [], 0)).toEqual(true);
  });

  test("cycles array has a few items and date is less than the finish of the current cycle", () => {
    // @ts-expect-error mocked `t` method
    jest.spyOn(i18n, "t").mockImplementation((key) => key);

    const date: Date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + 20);

    const cycles: Cycle[] = [];

    for (let i = 0; i < 6; ++i) {
      date.setDate(date.getDate() - 28);
      cycles.push({
        cycleLength: 28,
        periodLength: 6,
        startDate: date.toString(),
      });
    }

    const dateCheck = new Date(cycles[0].startDate);
    dateCheck.setDate(dateCheck.getDate() + 10);

    expect(getActiveDates(format(dateCheck, "yyyy-MM-dd"), cycles, 28)).toEqual(
      true,
    );
  });

  test("cycles array has a few items and date is more than the finish of the current cycle", () => {
    // @ts-expect-error mocked `t` method
    jest.spyOn(i18n, "t").mockImplementation((key) => key);

    const date: Date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + 20);

    const cycles: Cycle[] = [];

    for (let i = 0; i < 6; ++i) {
      date.setDate(date.getDate() - 28);
      cycles.push({
        cycleLength: 28,
        periodLength: 6,
        startDate: date.toString(),
      });
    }

    const dateCheck = new Date(cycles[0].startDate);
    dateCheck.setDate(dateCheck.getDate() + 40);

    expect(getActiveDates(format(dateCheck, "yyyy-MM-dd"), cycles, 28)).toEqual(
      false,
    );
  });

  test("delay a few days and check date is less then the current date", () => {
    // @ts-expect-error mocked `t` method
    jest.spyOn(i18n, "t").mockImplementation((key) => key);

    const date: Date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - 5);

    const cycles: Cycle[] = [];

    for (let i = 0; i < 6; ++i) {
      date.setDate(date.getDate() - 28);
      cycles.push({
        cycleLength: 28,
        periodLength: 6,
        startDate: date.toString(),
      });
    }

    const dateCheck = new Date(cycles[0].startDate);
    dateCheck.setDate(dateCheck.getDate() + 10);

    expect(getActiveDates(format(dateCheck, "yyyy-MM-dd"), cycles, 28)).toEqual(
      true,
    );
  });

  test("delay a few days and check date is more then the current date", () => {
    // @ts-expect-error mocked `t` method
    jest.spyOn(i18n, "t").mockImplementation((key) => key);

    const date: Date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - 5);

    const cycles: Cycle[] = [];

    for (let i = 0; i < 6; ++i) {
      date.setDate(date.getDate() - 28);
      cycles.push({
        cycleLength: 28,
        periodLength: 6,
        startDate: date.toString(),
      });
    }

    const dateCheck = new Date(cycles[0].startDate);
    dateCheck.setDate(dateCheck.getDate() + 40);

    expect(getActiveDates(format(dateCheck, "yyyy-MM-dd"), cycles, 28)).toEqual(
      false,
    );
  });
});

describe("getMarkModalActiveDates", () => {
  test("cycles array is empty", () => {
    // @ts-expect-error mocked `t` method
    jest.spyOn(i18n, "t").mockImplementation((key) => key);
    expect(getMarkModalActiveDates("", [])).toEqual(true);
  });

  test("cycles array has a few items and date is less than the finish of the last cycle", () => {
    // @ts-expect-error mocked `t` method
    jest.spyOn(i18n, "t").mockImplementation((key) => key);

    const date: Date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + 20);

    const cycles: Cycle[] = [];

    for (let i = 0; i < 6; ++i) {
      date.setDate(date.getDate() - 28);
      cycles.push({
        cycleLength: 28,
        periodLength: 6,
        startDate: date.toString(),
      });
    }

    const dateCheck = new Date(cycles[0].startDate);
    dateCheck.setDate(dateCheck.getDate() + 5);

    expect(
      getMarkModalActiveDates(format(dateCheck, "yyyy-MM-dd"), cycles),
    ).toEqual(false);
  });

  test("cycles array has a few items and date is more than the finish of the last cycle", () => {
    // @ts-expect-error mocked `t` method
    jest.spyOn(i18n, "t").mockImplementation((key) => key);

    const date: Date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + 20);

    const cycles: Cycle[] = [];

    for (let i = 0; i < 6; ++i) {
      date.setDate(date.getDate() - 28);
      cycles.push({
        cycleLength: 28,
        periodLength: 6,
        startDate: date.toString(),
      });
    }

    const dateCheck = new Date(cycles[0].startDate);
    dateCheck.setDate(dateCheck.getDate() + 40);

    expect(
      getMarkModalActiveDates(format(dateCheck, "yyyy-MM-dd"), cycles),
    ).toEqual(true);
  });
});

describe("getPastFuturePeriodDays", () => {
  test("cycles array is empty", () => {
    // @ts-expect-error mocked `t` method
    jest.spyOn(i18n, "t").mockImplementation((key) => key);

    const periodDates: string[] = [];
    const nowDate = new Date();
    nowDate.setHours(0, 0, 0, 0);

    for (let day = 0; day < 5; day++) {
      const periodDay = new Date(nowDate);
      periodDay.setHours(0, 0, 0, 0);
      periodDay.setDate(periodDay.getDate() + day);

      periodDates.push(format(periodDay, "yyyy-MM-dd"));
    }
    expect(getPastFuturePeriodDays([])).toEqual(periodDates);
  });

  test("cycles array has a few items", () => {
    // @ts-expect-error mocked `t` method
    jest.spyOn(i18n, "t").mockImplementation((key) => key);

    const date: Date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + 10);

    const cycles: Cycle[] = [];

    for (let i = 0; i < 6; ++i) {
      date.setDate(date.getDate() - 28);
      cycles.push({
        cycleLength: 28,
        periodLength: 5,
        startDate: date.toString(),
      });
    }

    const periodDates = getLastPeriodDays(cycles);
    const nowDate = new Date();
    nowDate.setHours(0, 0, 0, 0);

    for (let day = 0; day < 5; day++) {
      const periodDay = new Date(nowDate);
      periodDay.setHours(0, 0, 0, 0);
      periodDay.setDate(periodDay.getDate() + day);

      periodDates.push(format(periodDay, "yyyy-MM-dd"));
    }

    expect(getPastFuturePeriodDays(cycles)).toEqual(periodDates);
  });

  test("delay a few days", () => {
    // @ts-expect-error mocked `t` method
    jest.spyOn(i18n, "t").mockImplementation((key) => key);

    const date: Date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - 5);

    const cycles: Cycle[] = [];

    for (let i = 0; i < 6; ++i) {
      date.setDate(date.getDate() - 28);
      cycles.push({
        cycleLength: 28,
        periodLength: 5,
        startDate: date.toString(),
      });
    }

    const periodDates = getLastPeriodDays(cycles);
    const nowDate = new Date();
    nowDate.setHours(0, 0, 0, 0);

    for (let day = 0; day < 5; day++) {
      const periodDay = new Date(nowDate);
      periodDay.setHours(0, 0, 0, 0);
      periodDay.setDate(periodDay.getDate() + day);

      periodDates.push(format(periodDay, "yyyy-MM-dd"));
    }

    expect(getPastFuturePeriodDays(cycles)).toEqual(periodDates);
  });
});

describe("getLastStartDate", () => {
  test("cycles array is empty", () => {
    expect(getLastStartDate([])).toEqual("");
  });

  test("cycles array has a few items", () => {
    // @ts-expect-error mocked `t` method
    jest.spyOn(i18n, "t").mockImplementation((key) => key);

    const date: Date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + 15);

    const cycles: Cycle[] = [];

    for (let i = 0; i < 6; ++i) {
      date.setDate(date.getDate() - 28);
      cycles.push({
        cycleLength: 28,
        periodLength: 6,
        startDate: date.toString(),
      });
    }

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

    const date: Date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + 15);

    const cycles: Cycle[] = [];

    for (let i = 0; i < 6; ++i) {
      date.setDate(date.getDate() - 28);
      cycles.push({
        cycleLength: 28,
        periodLength: 6,
        startDate: date.toString(),
      });
    }

    expect(getLengthOfLastPeriod(cycles)).toEqual(cycles[0].periodLength);
  });
});
