import i18n from "i18next";
import { Cycle } from "../data/ClassCycle";
import {
  getOvulationStatus,
  getPregnancyChance,
  getDayOfCycle,
  getAverageLengthOfCycle,
  getAverageLengthOfPeriod,
  getDaysBeforePeriod,
  getPhase,
} from "../state/CalculationLogics";

describe("getOvulationStatus", () => {
  test("cycleLength is 0 and dayOfCycle is 0", () => {
    expect(getOvulationStatus(0, 0)).toEqual("");
  });

  test("returns `in 9 Days` if ovulation in 9 Days", () => {
    // @ts-expect-error mocked `t` method
    jest.spyOn(i18n, "t").mockImplementation((key) => key);
    expect(getOvulationStatus(28, 5)).toEqual("in 9 Days");
  });

  test("returns `tomorrow` if ovulation is tomorrow", () => {
    // @ts-expect-error mocked `t` method
    jest.spyOn(i18n, "t").mockImplementationOnce((key) => key);
    expect(getOvulationStatus(28, 13)).toEqual("tomorrow");
  });

  test("returns `today` if ovulation is today", () => {
    // @ts-expect-error mocked `t` method
    jest.spyOn(i18n, "t").mockImplementationOnce((key) => key);
    expect(getOvulationStatus(28, 14)).toEqual("today");
  });

  test("returns `possible` if ovulation is possible", () => {
    // @ts-expect-error mocked `t` method
    jest.spyOn(i18n, "t").mockImplementationOnce((key) => key);
    expect(getOvulationStatus(28, 15)).toEqual("possible");
  });

  test("returns `finished` if ovulation is finished", () => {
    // @ts-expect-error mocked `t` method
    jest.spyOn(i18n, "t").mockImplementationOnce((key) => key);
    expect(getOvulationStatus(28, 18)).toEqual("finished");
  });
});

describe("getPregnancyChance", () => {
  test("cycleLength is 0 and dayOfCycle is 0", () => {
    expect(getPregnancyChance(0, 0)).toEqual("");
  });

  test("returns `high` if pregnancy is high", () => {
    // @ts-expect-error mocked `t` method
    jest.spyOn(i18n, "t").mockImplementation((key) => key);
    expect(getPregnancyChance(28, 14)).toEqual("high");
  });

  test("returns `low` if pregnancy is low", () => {
    // @ts-expect-error mocked `t` method
    jest.spyOn(i18n, "t").mockImplementation((key) => key);
    expect(getPregnancyChance(28, 20)).toEqual("low");
  });
});

describe("getDayOfCycle", () => {
  test("startDate is non", () => {
    expect(getDayOfCycle("")).toEqual("");
  });

  test("returns 14 if current day is 14", () => {
    // @ts-expect-error mocked `t` method
    jest.spyOn(i18n, "t").mockImplementation((key) => key);

    const date: Date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - 13);
    expect(getDayOfCycle(date.toString())).toEqual("14");
  });
});

describe("getAverageLengthOfCycle", () => {
  test("cycle length is 0", () => {
    expect(getAverageLengthOfCycle([])).toEqual(0);
  });

  test("returns 28 if cycle length is 1", () => {
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

  test("returns 28 cycle length over 1", () => {
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
  test("cycle length is 0", () => {
    expect(getAverageLengthOfPeriod([])).toEqual(0);
  });

  test("returns 5 if cycle length is 1", () => {
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

  test("returns 5 cycle length over 1", () => {
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
  test("cycleLength is 0 and startDate is non", () => {
    // @ts-expect-error mocked `t` method
    jest.spyOn(i18n, "t").mockImplementation((key) => key);

    expect(getDaysBeforePeriod(0, "")).toEqual({
      title: i18n.t("Period in"),
      days: i18n.t("no info"),
    });
  });

  test("returns `Period in 10 Day` if period in 10 Day", () => {
    // @ts-expect-error mocked `t` method
    jest.spyOn(i18n, "t").mockImplementation((key) => key);

    const date: Date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - 18);
    expect(getDaysBeforePeriod(28, date.toString())).toEqual({
      title: i18n.t("Period in"),
      days: `10 ${i18n.t("Days_interval", {
        postProcess: "interval",
        count: 10,
      })}`,
    });
  });

  test("returns `Period in 1 Day` if period in 1 Day", () => {
    // @ts-expect-error mocked `t` method
    jest.spyOn(i18n, "t").mockImplementation((key) => key);

    const date: Date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - 27);
    expect(getDaysBeforePeriod(28, date.toString())).toEqual({
      title: i18n.t("Period in"),
      days: `1 ${i18n.t("Days_interval", {
        postProcess: "interval",
        count: 1,
      })}`,
    });
  });

  test("returns `today` if period is today", () => {
    // @ts-expect-error mocked `t` method
    jest.spyOn(i18n, "t").mockImplementation((key) => key);

    const date: Date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - 28);
    expect(getDaysBeforePeriod(28, date.toString())).toEqual({
      title: i18n.t("Period"),
      days: i18n.t("today"),
    });
  });

  test("returns `Delay 1 Day` if delay 1 day", () => {
    // @ts-expect-error mocked `t` method
    jest.spyOn(i18n, "t").mockImplementation((key) => key);

    const date: Date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - 29);
    expect(getDaysBeforePeriod(28, date.toString())).toEqual({
      title: i18n.t("Delay"),
      days: `1 ${i18n.t("Days_interval", {
        postProcess: "interval",
        count: 1,
      })}`,
    });
  });

  test("returns `Delay 10 Days` if delay 10 days", () => {
    // @ts-expect-error mocked `t` method
    jest.spyOn(i18n, "t").mockImplementation((key) => key);

    const date: Date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - 38);
    expect(getDaysBeforePeriod(28, date.toString())).toEqual({
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
    title: "The menstrual cycle can be divided into 4 phases.",
    description:
      "When information about your cycle appears, it will be reported which phase you are in.",
    symptoms: [
      "This section will indicate the symptoms characteristic of this cycle.",
    ],
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
  test("lengthOfCycle is 0 and lengthOfPeriod is 0 and currentDay is 0", () => {
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
